'use client'

import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import type { VideoWithProgress, VideoResourceType } from '@/lib/supabase/courses/types'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2, Video } from 'lucide-react'
import { isValidVideoUrl, parseDuration } from '@/lib/utils/video-utils'

interface VideoFormData {
    title: string
    description?: string
    video_url: string
    duration?: number
    resources: Array<{
        title: string
        url: string
        type: VideoResourceType
    }>
}

interface VideoFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: VideoFormData) => void
    video?: VideoWithProgress | null
}

export function VideoFormDialog({ open, onOpenChange, onSubmit, video }: VideoFormDialogProps) {
    const { register, handleSubmit, control, reset, formState: { errors }, setError, clearErrors } = useForm<VideoFormData>({
        defaultValues: {
            title: '',
            description: '',
            video_url: '',
            duration: undefined,
            resources: [],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'resources',
    })

    useEffect(() => {
        if (video) {
            reset({
                title: video.title,
                description: video.description || '',
                video_url: video.video_url,
                duration: video.duration || undefined,
                resources: video.resources?.map(r => ({
                    title: r.title,
                    url: r.url,
                    type: r.type,
                })) || [],
            })
        } else {
            reset({
                title: '',
                description: '',
                video_url: '',
                duration: undefined,
                resources: [],
            })
        }
    }, [video, reset, open])

    function handleFormSubmit(data: VideoFormData) {
        // Validate video URL
        if (!isValidVideoUrl(data.video_url)) {
            setError('video_url', {
                type: 'manual',
                message: 'Please enter a valid YouTube or Vimeo URL',
            })
            return
        }

        onSubmit(data)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{video ? 'Edit Video' : 'Add Video'}</DialogTitle>
                    <DialogDescription>
                        {video ? 'Update video details and resources' : 'Add a new video to this section'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Video Title *</Label>
                            <Input
                                id="title"
                                {...register('title', { required: 'Title is required' })}
                                placeholder="e.g., Introduction to Components"
                            />
                            {errors.title && (
                                <p className="text-sm text-destructive">{errors.title.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="video_url">Video URL *</Label>
                            <Input
                                id="video_url"
                                {...register('video_url', {
                                    required: 'Video URL is required',
                                    validate: (value) => isValidVideoUrl(value) || 'Please enter a valid YouTube or Vimeo URL'
                                })}
                                placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                                onChange={() => clearErrors('video_url')}
                            />
                            {errors.video_url && (
                                <p className="text-sm text-destructive">{errors.video_url.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Supported: YouTube and Vimeo URLs
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                {...register('description')}
                                placeholder="Describe what's covered in this video..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration (optional)</Label>
                            <Input
                                id="duration"
                                type="text"
                                placeholder="e.g., 15:30 or 1:23:45"
                                onChange={(e) => {
                                    const value = e.target.value
                                    if (value) {
                                        const seconds = parseDuration(value)
                                        e.target.value = value
                                        // Store as seconds in hidden field
                                        const durationInput = document.getElementById('duration-seconds') as HTMLInputElement
                                        if (durationInput) durationInput.value = seconds.toString()
                                    }
                                }}
                                defaultValue={video?.duration ?
                                    `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}`
                                    : ''}
                            />
                            <input
                                id="duration-seconds"
                                type="hidden"
                                {...register('duration', { valueAsNumber: true })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Format: MM:SS or HH:MM:SS
                            </p>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Resources (optional)</Label>
                                <p className="text-xs text-muted-foreground">
                                    Add external links for PDFs, notes, code, etc.
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ title: '', url: '', type: 'link' })}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Resource
                            </Button>
                        </div>

                        {fields.length > 0 && (
                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex gap-2 items-start p-3 border rounded-lg">
                                        <div className="flex-1 space-y-3">
                                            <Input
                                                {...register(`resources.${index}.title` as const, {
                                                    required: 'Resource title is required'
                                                })}
                                                placeholder="Resource title"
                                            />
                                            <Input
                                                {...register(`resources.${index}.url` as const, {
                                                    required: 'Resource URL is required'
                                                })}
                                                placeholder="https://..."
                                                type="url"
                                            />
                                            <Select
                                                defaultValue={field.type}
                                                onValueChange={(value) => {
                                                    const resources = document.getElementsByName(`resources.${index}.type`)[0] as HTMLInputElement
                                                    if (resources) resources.value = value
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Resource type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pdf">PDF</SelectItem>
                                                    <SelectItem value="notes">Notes</SelectItem>
                                                    <SelectItem value="code">Code</SelectItem>
                                                    <SelectItem value="link">Link</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <input
                                                type="hidden"
                                                {...register(`resources.${index}.type` as const)}
                                                defaultValue={field.type}
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {video ? 'Update Video' : 'Add Video'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
