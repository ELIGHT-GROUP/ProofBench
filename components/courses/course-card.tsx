'use client'

import { useRouter } from 'next/navigation'
import type { CourseWithProgress } from '@/lib/supabase/courses/types'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Clock, BookOpen } from 'lucide-react'
import { formatDuration, formatRelativeTime } from '@/lib/utils/video-utils'
import Image from 'next/image'

interface CourseCardProps {
    course: CourseWithProgress
}

export function CourseCard({ course }: CourseCardProps) {
    const router = useRouter()

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            programming: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
            design: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20',
            business: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
            marketing: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20',
            personal_development: 'bg-pink-500/10 text-pink-500 hover:bg-pink-500/20',
            other: 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20',
        }
        return colors[category] || colors.other
    }

    return (
        <Card
            className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
            onClick={() => router.push(`/dashboard/courses/${course.id}`)}
        >
            {/* Thumbnail */}
            <div className="relative h-48 w-full overflow-hidden bg-muted">
                {course.thumbnail_url ? (
                    <Image
                        src={course.thumbnail_url}
                        alt={course.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-16 w-16 text-muted-foreground/20" />
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                    <Badge className={getCategoryColor(course.category)}>
                        {course.category.replace('_', ' ')}
                    </Badge>
                </div>

                {/* Progress Badge */}
                {course.progress_percentage > 0 && (
                    <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                            {course.progress_percentage}%
                        </Badge>
                    </div>
                )}
            </div>

            <CardHeader>
                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                    {course.description || 'No description available'}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.total_videos} videos</span>
                    </div>
                    {course.last_watched_at && (
                        <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatRelativeTime(course.last_watched_at)}</span>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                {course.progress_percentage > 0 && (
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>{course.completed_videos} / {course.total_videos} completed</span>
                        </div>
                        <Progress value={course.progress_percentage} className="h-2" />
                    </div>
                )}
            </CardContent>

            {course.tags && course.tags.length > 0 && (
                <CardFooter className="pt-0">
                    <div className="flex flex-wrap gap-1">
                        {course.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                        {course.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{course.tags.length - 3}
                            </Badge>
                        )}
                    </div>
                </CardFooter>
            )}
        </Card>
    )
}
