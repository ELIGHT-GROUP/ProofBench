'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCourses, deleteCourse, publishCourse } from '@/lib/supabase/courses'

import type { Course } from '@/lib/supabase/courses/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
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
import { Switch } from '@/components/ui/switch'
import { Plus, Search, Pencil, Trash2, Eye } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRelativeTime } from '@/lib/utils/video-utils'
import { toast } from 'sonner'

export default function AdminCoursesPage() {
    const router = useRouter()
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showPublishedOnly, setShowPublishedOnly] = useState<boolean | undefined>(undefined)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)

    useEffect(() => {
        loadCourses()
    }, [showPublishedOnly])

    async function loadCourses() {
        try {
            setLoading(true)
            const data = await getCourses({ published: showPublishedOnly })
            setCourses(data)
        } catch (error) {
            console.error('Error loading courses:', error)
            toast.error('Failed to load courses')
        } finally {
            setLoading(false)
        }
    }

    async function handlePublishToggle(course: Course) {
        try {
            await publishCourse(course.id, !course.published)
            toast.success(`Course ${!course.published ? 'published' : 'unpublished'} successfully`)
            loadCourses()
        } catch (error) {
            console.error('Error toggling publish status:', error)
            toast.error('Failed to update course status')
        }
    }

    async function handleDelete() {
        if (!courseToDelete) return

        try {
            await deleteCourse(courseToDelete.id)
            toast.success('Course deleted successfully')
            setDeleteDialogOpen(false)
            setCourseToDelete(null)
            loadCourses()
        } catch (error) {
            console.error('Error deleting course:', error)
            toast.error('Failed to delete course')
        }
    }

    function openDeleteDialog(course: Course) {
        setCourseToDelete(course)
        setDeleteDialogOpen(true)
    }

    const filteredCourses = courses.filter((course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Manage Courses</h1>
                    <p className="text-muted-foreground mt-1">
                        Create and manage your course library
                    </p>
                </div>
                <Button onClick={() => router.push('/dashboard/admin/courses/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Course
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant={showPublishedOnly === undefined ? 'default' : 'outline'}
                        onClick={() => setShowPublishedOnly(undefined)}
                    >
                        All
                    </Button>
                    <Button
                        variant={showPublishedOnly === true ? 'default' : 'outline'}
                        onClick={() => setShowPublishedOnly(true)}
                    >
                        Published
                    </Button>
                    <Button
                        variant={showPublishedOnly === false ? 'default' : 'outline'}
                        onClick={() => setShowPublishedOnly(false)}
                    >
                        Drafts
                    </Button>
                </div>
            </div>

            {/* Courses Table */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-12 border rounded-lg">
                    <p className="text-muted-foreground text-lg">
                        {searchQuery
                            ? 'No courses found matching your search'
                            : 'No courses yet. Create your first course to get started!'}
                    </p>
                </div>
            ) : (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Course</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCourses.map((course) => (
                                <TableRow key={course.id}>
                                    <TableCell>
                                        <div className="max-w-md">
                                            <p className="font-medium">{course.title}</p>
                                            {course.description && (
                                                <p className="text-sm text-muted-foreground line-clamp-1">
                                                    {course.description}
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {course.category.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={course.published}
                                                onCheckedChange={() => handlePublishToggle(course)}
                                            />
                                            <span className="text-sm">
                                                {course.published ? 'Published' : 'Draft'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatRelativeTime(course.created_at)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => router.push(`/dashboard/courses/${course.id}`)}
                                                title="Preview"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => router.push(`/dashboard/admin/courses/${course.id}/edit`)}
                                                title="Edit"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openDeleteDialog(course)}
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Course</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{courseToDelete?.title}"? This action cannot be undone and will also delete all sections, videos, and student progress associated with this course.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCourseToDelete(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
