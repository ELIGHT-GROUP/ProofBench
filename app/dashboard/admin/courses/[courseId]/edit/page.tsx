'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCourseById } from '@/lib/supabase/courses'

import type { CourseWithSections } from '@/lib/supabase/courses/types'
import { CourseEditor } from '@/components/admin/courses/course-editor'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, AlertCircle } from 'lucide-react'

export default function EditCoursePage() {
    const router = useRouter()
    const params = useParams()
    const courseId = params.courseId as string

    const [course, setCourse] = useState<CourseWithSections | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadCourse()
    }, [courseId])

    async function loadCourse() {
        try {
            setLoading(true)
            const data = await getCourseById(courseId)
            if (!data) {
                setError('Course not found')
            } else {
                setCourse(data)
            }
        } catch (err) {
            console.error('Error loading course:', err)
            setError('Failed to load course')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Skeleton className="h-8 w-64 mb-4" />
                <Skeleton className="h-96 w-full" />
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
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Courses
                </Button>
                <h1 className="text-3xl font-bold">Edit Course</h1>
                <p className="text-muted-foreground mt-1">
                    Update course details, sections, and videos
                </p>
            </div>

            <CourseEditor course={course} />
        </div>
    )
}
