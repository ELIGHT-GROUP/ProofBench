'use client'

import { useState } from 'react'
import type { VideoWithProgress, VideoResource } from '@/lib/supabase/courses/types'
import { createVideo, updateVideo, deleteVideo, createVideoResource, deleteVideoResource } from '@/lib/supabase/courses'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Plus, Pencil, Trash2, GripVertical, Play } from 'lucide-react'
import { formatDuration } from '@/lib/utils/video-utils'
import { toast } from 'sonner'
import { VideoFormDialog } from './video-form-dialog'

interface VideoManagerProps {
    sectionId: string
    initialVideos: VideoWithProgress[]
}

export function VideoManager({ sectionId, initialVideos }: VideoManagerProps) {
    const [videos, setVideos] = useState<VideoWithProgress[]>(initialVideos)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingVideo, setEditingVideo] = useState<VideoWithProgress | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [videoToDelete, setVideoToDelete] = useState<VideoWithProgress | null>(null)

    async function handleCreateVideo(data: any) {
        try {
            const newVideo = await createVideo(sectionId, {
                title: data.title,
                description: data.description,
                video_url: data.video_url,
                duration: data.duration,
                order_index: videos.length,
            })

            // Add resources if any
            const resources: VideoResource[] = []
            if (data.resources && data.resources.length > 0) {
                for (const resource of data.resources) {
                    const created = await createVideoResource(newVideo.id, resource)
                    resources.push(created)
                }
            }

            setVideos([...videos, { ...newVideo, resources }])
            setDialogOpen(false)
            toast.success('Video added')
        } catch (error) {
            console.error('Error creating video:', error)
            toast.error('Failed to add video')
        }
    }

    async function handleUpdateVideo(data: any) {
        if (!editingVideo) return

        try {
            const updated = await updateVideo(editingVideo.id, {
                title: data.title,
                description: data.description,
                video_url: data.video_url,
                duration: data.duration,
            })

            // Update resources - delete old ones and create new ones
            if (editingVideo.resources) {
                for (const resource of editingVideo.resources) {
                    await deleteVideoResource(resource.id)
                }
            }

            const resources: VideoResource[] = []
            if (data.resources && data.resources.length > 0) {
                for (const resource of data.resources) {
                    const created = await createVideoResource(editingVideo.id, resource)
                    resources.push(created)
                }
            }

            setVideos(videos.map(v =>
                v.id === editingVideo.id ? { ...updated, resources } : v
            ))
            setEditingVideo(null)
            setDialogOpen(false)
            toast.success('Video updated')
        } catch (error) {
            console.error('Error updating video:', error)
            toast.error('Failed to update video')
        }
    }

    async function handleDeleteVideo() {
        if (!videoToDelete) return

        try {
            await deleteVideo(videoToDelete.id)
            setVideos(videos.filter(v => v.id !== videoToDelete.id))
            setDeleteDialogOpen(false)
            setVideoToDelete(null)
            toast.success('Video deleted')
        } catch (error) {
            console.error('Error deleting video:', error)
            toast.error('Failed to delete video')
        }
    }

    function openEditDialog(video: VideoWithProgress) {
        setEditingVideo(video)
        setDialogOpen(true)
    }

    function openDeleteDialog(video: VideoWithProgress) {
        setVideoToDelete(video)
        setDeleteDialogOpen(true)
    }

    function closeDialog() {
        setDialogOpen(false)
        setEditingVideo(null)
    }

    return (
        <div className="space-y-3 pl-6 pt-4">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(true)}
                className="w-full"
            >
                <Plus className="h-4 w-4 mr-2" />
                Add Video
            </Button>

            {videos.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                    No videos yet. Add your first video to this section.
                </div>
            ) : (
                <div className="space-y-2">
                    {videos.map((video, index) => (
                        <div
                            key={video.id}
                            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                            <Play className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{video.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    {video.duration && (
                                        <span className="text-xs text-muted-foreground">
                                            {formatDuration(video.duration)}
                                        </span>
                                    )}
                                    {video.resources && video.resources.length > 0 && (
                                        <Badge variant="outline" className="text-xs">
                                            {video.resources.length} resources
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => openEditDialog(video)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => openDeleteDialog(video)}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <VideoFormDialog
                open={dialogOpen}
                onOpenChange={closeDialog}
                onSubmit={editingVideo ? handleUpdateVideo : handleCreateVideo}
                video={editingVideo}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Video</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{videoToDelete?.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setVideoToDelete(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteVideo}
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
