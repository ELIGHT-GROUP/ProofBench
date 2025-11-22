'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
    getVideoComments,
    createComment,
    type VideoCommentWithReplies,
} from '@/lib/supabase/courses'
import { CommentForm } from './comment-form'
import { CommentItem } from './comment-item'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

interface CommentSectionProps {
    videoId: string
}

export function CommentSection({ videoId }: CommentSectionProps) {
    const [comments, setComments] = useState<VideoCommentWithReplies[]>([])
    const [loading, setLoading] = useState(true)
    const [currentUserId, setCurrentUserId] = useState<string | undefined>()

    useEffect(() => {
        loadComments()
        getCurrentUser()
    }, [videoId])

    async function getCurrentUser() {
        const {
            data: { user },
        } = await supabase.auth.getUser()
        setCurrentUserId(user?.id)
    }

    async function loadComments() {
        try {
            setLoading(true)
            const data = await getVideoComments(videoId)
            setComments(data)
        } catch (error) {
            console.error('Error loading comments:', error)
            toast.error('Failed to load comments')
        } finally {
            setLoading(false)
        }
    }

    async function handleCreateComment(content: string) {
        try {
            await createComment(videoId, { content })
            toast.success('Comment added')
            loadComments()
        } catch (error) {
            console.error('Error creating comment:', error)
            toast.error('Failed to add comment')
            throw error
        }
    }

    async function handleReply(parentId: string, content: string) {
        try {
            await createComment(videoId, { content, parent_id: parentId })
            toast.success('Reply added')
            loadComments()
        } catch (error) {
            console.error('Error creating reply:', error)
            toast.error('Failed to add reply')
            throw error
        }
    }

    const totalComments = comments.reduce((acc, comment) => {
        return acc + 1 + (comment.replies?.length || 0)
    }, 0)

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Comments
                    {totalComments > 0 && (
                        <span className="text-sm font-normal text-muted-foreground">
                            ({totalComments})
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Comment Form */}
                {currentUserId ? (
                    <CommentForm onSubmit={handleCreateComment} />
                ) : (
                    <div className="text-sm text-muted-foreground text-center py-4 border rounded-lg">
                        Please sign in to leave a comment
                    </div>
                )}

                {/* Comments List */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-3">
                                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No comments yet. Be the first to comment!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {comments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                currentUserId={currentUserId}
                                onReply={handleReply}
                                onUpdate={loadComments}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
