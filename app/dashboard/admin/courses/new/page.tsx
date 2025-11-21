'use client'

import { useRouter } from 'next/navigation'
import { CourseEditor } from '@/components/admin/courses/course-editor'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function NewCoursePage() {
    const router = useRouter()

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
                <h1 className="text-3xl font-bold">Create New Course</h1>
                <p className="text-muted-foreground mt-1">
                    Fill in the details below to create a new course
                </p>
            </div>

            <CourseEditor />
        </div>
    )
}
