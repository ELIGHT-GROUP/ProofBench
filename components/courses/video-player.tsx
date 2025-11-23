'use client'

import { useEffect, useRef, useState } from 'react'
import type { VideoWithProgress } from '@/lib/supabase/courses/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { updateVideoProgress, markVideoComplete } from '@/lib/supabase/courses'

import { getEmbedUrl, isValidVideoUrl, shouldMarkComplete } from '@/lib/utils/video-utils'
import { CheckCircle2, AlertCircle, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
    video: VideoWithProgress
    onComplete?: () => void
}

export function VideoPlayer({ video, onComplete }: VideoPlayerProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [embedUrl, setEmbedUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isCompleted, setIsCompleted] = useState(video.progress?.completed || false)
    const [currentProgress, setCurrentProgress] = useState(video.progress?.watch_percentage || 0)
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const lastSavedPositionRef = useRef<number>(0)

    useEffect(() => {
        // Validate and set embed URL
        if (!isValidVideoUrl(video.video_url)) {
            setError('Invalid video URL. Please contact the course administrator.')
            return
        }

        const url = getEmbedUrl(video.video_url)
        if (!url) {
            setError('Unable to embed this video. Please contact support.')
            return
        }

        setEmbedUrl(url)
        setError(null)
        setIsCompleted(video.progress?.completed || false)
        setCurrentProgress(video.progress?.watch_percentage || 0)

        // Start progress tracking interval
        startProgressTracking()

        return () => {
            stopProgressTracking()
        }
    }, [video.id, video.video_url])

    const startProgressTracking = () => {
        // Save progress every 10 seconds
        progressIntervalRef.current = setInterval(() => {
            saveProgress()
        }, 10000)
    }

    const stopProgressTracking = () => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current)
            progressIntervalRef.current = null
        }
        // Save one last time when stopping
        saveProgress()
    }

    const saveProgress = async () => {
        try {
            // In a real implementation with YouTube/Vimeo API, we would get actual playback position
            // For now, we'll simulate progress tracking
            // You would integrate YouTube IFrame API or Vimeo Player API here

            // Simulated progress (in production, get from player API)
            const simulatedPosition = lastSavedPositionRef.current + 10
            const simulatedPercentage = video.duration
                ? Math.min(100, Math.round((simulatedPosition / video.duration) * 100))
                : currentProgress

            if (simulatedPercentage > currentProgress) {
                await updateVideoProgress(video.id, {
                    last_position: simulatedPosition,
                    watch_percentage: simulatedPercentage,
                    completed: shouldMarkComplete(simulatedPercentage),
                })

                setCurrentProgress(simulatedPercentage)
                lastSavedPositionRef.current = simulatedPosition

                // Check if should mark as complete
                if (shouldMarkComplete(simulatedPercentage) && !isCompleted) {
                    setIsCompleted(true)
                    onComplete?.()
                }
            }
        } catch (error) {
            console.error('Error saving progress:', error)
        }
    }

    const handleMarkComplete = async () => {
        try {
            await markVideoComplete(video.id)
            setIsCompleted(true)
            setCurrentProgress(100)
            onComplete?.()
        } catch (error) {
            console.error('Error marking complete:', error)
        }
    }

    if (error) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    if (!embedUrl) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                        <div className="text-center">
                            <Play className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">Loading video...</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                            {video.title}
                            {isCompleted && (
                                <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Completed
                                </Badge>
                            )}
                        </CardTitle>
                        {video.description && (
                            <CardDescription className="mt-2">{video.description}</CardDescription>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Video Iframe */}
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                    <iframe
                        ref={iframeRef}
                        src={embedUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={video.title}
                    />
                </div>

                {/* Progress and Actions */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        {currentProgress > 0 && !isCompleted && (
                            <span>Progress: {currentProgress}%</span>
                        )}
                    </div>
                    {!isCompleted && currentProgress > 80 && (
                        <Button onClick={handleMarkComplete} size="sm">
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Mark as Complete
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}