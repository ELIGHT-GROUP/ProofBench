'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { VideoCommentWithReplies, VideoCommentWithUser } from '@/lib/supabase/courses'
import { updateComment, deleteComment } from '@/lib/supabase/courses'
import { CommentForm } from './comment-form'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MessageSquare, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/video-utils'
import { toast } from 'sonner'

interface CommentItemProps {
    comment: VideoCommentWithReplies
    currentUserId?: string
    onReply: (parentId: string, content: string) => Promise<void>
    onUpdate: () => void
    depth?: number
}

export function CommentItem({
    comment,
    currentUserId,
    onReply,
    onUpdate,
    depth = 0,
}: CommentItemProps) {
    const router = useRouter()
    const [showReplyForm, setShowReplyForm] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)

    const isOwnComment = currentUserId === comment.user_id
    const isAdmin = comment.user.role === 'admin' || comment.user.role === 'superadmin'
    const maxDepth = 1 // Maximum nesting level (0 = root, 1 = reply)

    const handleReply = async (content: string) => {
        await onReply(comment.id, content)
        setShowReplyForm(false)
    }

    const handleEdit = async (content: string) => {
        try {
            await updateComment(comment.id, { content })
            toast.success('Comment updated')
            setIsEditing(false)
            onUpdate()
        } catch (error) {
            console.error('Error updating comment:', error)
            toast.error('Failed to update comment')
        }
    }

    const handleDelete = async () => {
        try {
            await deleteComment(comment.id)
            toast.success('Comment deleted')
            setShowDeleteDialog(false)
            onUpdate()
        } catch (error) {
            console.error('Error deleting comment:', error)
            toast.error('Failed to delete comment')
        }
    }

    const getInitials = (name: string | null) => {
        if (!name) return '?'
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <div className="group">
            <div className="flex gap-3">
                {/* Avatar */}
                <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={comment.user.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                        {getInitials(comment.user.full_name)}
                    </AvatarFallback>
                </Avatar>

                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                            {comment.user.full_name || 'Anonymous'}
                        </span>
                        {isAdmin && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                Admin
                            </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(comment.created_at)}
                        </span>
                        {comment.updated_at !== comment.created_at && (
                            <span className="text-xs text-muted-foreground">(edited)</span>
                        )}

                        {/* Actions Menu */}
                        {isOwnComment && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                                    >
                                        <MoreVertical className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                        <Pencil className="h-4 w-4 mr-2" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => setShowDeleteDialog(true)}
                                        className="text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    {/* Comment Body */}
                    {isEditing ? (
                        <div className="mb-2">
                            <CommentForm
                                onSubmit={handleEdit}
                                onCancel={() => setIsEditing(false)}
                                placeholder="Edit your comment..."
                                submitLabel="Save"
                                initialValue={comment.content}
                                autoFocus
                            />
                        </div>
                    ) : (
                        <p className="text-sm text-foreground whitespace-pre-wrap wrap-break-word mb-2">
                            {comment.content}
                        </p>
                    )}

                    {/* Reply Button */}
                    {!isEditing && depth < maxDepth && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => setShowReplyForm(!showReplyForm)}
                        >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Reply
                        </Button>
                    )}

                    {/* Reply Form */}
                    {showReplyForm && (
                        <div className="mt-3">
                            <CommentForm
                                onSubmit={handleReply}
                                onCancel={() => setShowReplyForm(false)}
                                placeholder="Write a reply..."
                                submitLabel="Reply"
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Nested Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 space-y-4 border-l-2 border-muted pl-4">
                            {comment.replies.map((reply) => (
                                <CommentItem
                                    key={reply.id}
                                    comment={{ ...reply, replies: [] }}
                                    currentUserId={currentUserId}
                                    onReply={onReply}
                                    onUpdate={onUpdate}
                                    depth={depth + 1}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this comment? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
