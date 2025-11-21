'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCoursesWithProgress, getContinueWatchingCourses } from '@/lib/supabase/courses'

import type { CourseWithProgress } from '@/lib/supabase/courses/types'
import { CourseCard } from '@/components/courses/course-card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function CoursesPage() {
    const router = useRouter()
    const [courses, setCourses] = useState<CourseWithProgress[]>([])
    const [continueWatching, setContinueWatching] = useState<CourseWithProgress[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')

    useEffect(() => {
        loadCourses()
    }, [])

    async function loadCourses() {
        try {
            setLoading(true)
            const [allCourses, watching] = await Promise.all([
                getCoursesWithProgress({ published: true }),
                getContinueWatchingCourses(),
            ])
            setCourses(allCourses)
            setContinueWatching(watching)
        } catch (error) {
            console.error('Error loading courses:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredCourses = courses.filter((course) => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter
        return matchesSearch && matchesCategory
    })

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Courses</h1>
                <p className="text-muted-foreground">
                    Browse our collection of free courses and start learning today
                </p>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="programming">Programming</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="personal_development">Personal Development</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Continue Watching Section */}
            {continueWatching.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold mb-4">Continue Watching</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {continueWatching.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                </div>
            )}

            {/* All Courses */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">
                    {continueWatching.length > 0 ? 'All Courses' : 'Available Courses'}
                </h2>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="h-48 w-full rounded-lg" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">
                            {searchQuery || categoryFilter !== 'all'
                                ? 'No courses found matching your criteria'
                                : 'No courses available yet'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
