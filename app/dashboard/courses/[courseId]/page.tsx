'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getCourseById } from '@/lib/supabase/courses'

import type { CourseWithSections, VideoWithProgress } from '@/lib/supabase/courses/types'

import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { CoursePlaylist, VideoPlayer, VideoResources } from '@/components/courses'

export default function CourseDetailPage() {
    const params = useParams()
    const courseId = params.courseId as string

    const [course, setCourse] = useState<CourseWithSections | null>(null)
    const [currentVideo, setCurrentVideo] = useState<VideoWithProgress | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadCourse()
    }, [courseId])

    async function loadCourse() {
        try {
            setLoading(true)
            setError(null)
            const data = await getCourseById(courseId)

            if (!data) {
                setError('Course not found')
                return
            }

            setCourse(data)

            // Set first video as current if no video is selected
            if (data.sections.length > 0 && data.sections[0].videos.length > 0) {
                setCurrentVideo(data.sections[0].videos[0])
            }
        } catch (err) {
            console.error('Error loading course:', err)
            setError('Failed to load course. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleVideoSelect = (video: VideoWithProgress) => {
        setCurrentVideo(video)
    }

    const handleVideoComplete = () => {
        // Reload course data to update progress
        loadCourse()
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Skeleton className="h-8 w-64 mb-4" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <Skeleton className="aspect-video w-full rounded-lg" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                    <div>
                        <Skeleton className="h-[600px] w-full rounded-lg" />
                    </div>
                </div>
            </div>
        )
    }

    if (error || !course) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error || 'Course not found'}</AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Course Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                {course.description && (
                    <p className="text-muted-foreground">{course.description}</p>
                )}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Video Player and Resources */}
                <div className="lg:col-span-2 space-y-6">
                    {currentVideo ? (
                        <>
                            <VideoPlayer
                                video={currentVideo}
                                onComplete={handleVideoComplete}
                            />

                            {currentVideo.resources && currentVideo.resources.length > 0 && (
                                <VideoResources resources={currentVideo.resources} />
                            )}
                        </>
                    ) : (
                        <div className="aspect-video rounded-lg border-2 border-dashed border-muted flex items-center justify-center">
                            <p className="text-muted-foreground">No videos available in this course</p>
                        </div>
                    )}
                </div>

                {/* Right Column: Course Playlist */}
                <div className="lg:col-span-1">
                    <CoursePlaylist
                        sections={course.sections}
                        currentVideo={currentVideo}
                        onVideoSelect={handleVideoSelect}
                    />
                </div>
            </div>
        </div>
    )
}
