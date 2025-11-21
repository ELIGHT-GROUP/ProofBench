'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import type { CourseWithSections, CreateCourseData, CourseCategory } from '@/lib/supabase/courses/types'
import { createCourse, updateCourse } from '@/lib/supabase/courses'


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { SectionManager } from './section-manager'

interface CourseEditorProps {
    course?: CourseWithSections
}

export function CourseEditor({ course }: CourseEditorProps) {
    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [currentCourseId, setCurrentCourseId] = useState(course?.id)

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CreateCourseData>({
        defaultValues: {
            title: course?.title || '',
            description: course?.description || '',
            category: course?.category || 'other',
            thumbnail_url: course?.thumbnail_url || '',
            tags: course?.tags || [],
            published: course?.published || false,
        },
    })

    const published = watch('published')

    async function onSubmit(data: CreateCourseData) {
        try {
            setSaving(true)

            if (currentCourseId) {
                // Update existing course
                await updateCourse(currentCourseId, data)
                toast.success('Course updated successfully')
            } else {
                // Create new course
                const newCourse = await createCourse(data)
                setCurrentCourseId(newCourse.id)
                toast.success('Course created successfully')
                router.push(`/dashboard/admin/courses/${newCourse.id}/edit`)
            }
        } catch (error) {
            console.error('Error saving course:', error)
            toast.error('Failed to save course')
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Tabs defaultValue="details" className="space-y-6">
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="content" disabled={!currentCourseId}>
                            Content
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={published}
                                onCheckedChange={(checked) => setValue('published', checked)}
                            />
                            <Label>Published</Label>
                        </div>
                        <Button type="submit" disabled={saving}>
                            <Save className="h-4 w-4 mr-2" />
                            {saving ? 'Saving...' : currentCourseId ? 'Save Changes' : 'Create Course'}
                        </Button>
                        {currentCourseId && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push(`/dashboard/courses/${currentCourseId}`)}
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                            </Button>
                        )}
                    </div>
                </div>

                <TabsContent value="details" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Information</CardTitle>
                            <CardDescription>
                                Basic details about your course
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Course Title *</Label>
                                <Input
                                    id="title"
                                    {...register('title', { required: 'Title is required' })}
                                    placeholder="e.g., Introduction to React"
                                />
                                {errors.title && (
                                    <p className="text-sm text-destructive">{errors.title.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    {...register('description')}
                                    placeholder="Describe what students will learn in this course..."
                                    rows={4}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <Select
                                        value={watch('category')}
                                        onValueChange={(value) => setValue('category', value as CourseCategory)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="programming">Programming</SelectItem>
                                            <SelectItem value="design">Design</SelectItem>
                                            <SelectItem value="business">Business</SelectItem>
                                            <SelectItem value="marketing">Marketing</SelectItem>
                                            <SelectItem value="personal_development">Personal Development</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                                    <Input
                                        id="thumbnail_url"
                                        {...register('thumbnail_url')}
                                        placeholder="https://example.com/image.jpg"
                                        type="url"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags (comma-separated)</Label>
                                <Input
                                    id="tags"
                                    placeholder="react, javascript, frontend"
                                    defaultValue={course?.tags?.join(', ') || ''}
                                    onChange={(e) => {
                                        const tags = e.target.value
                                            .split(',')
                                            .map(tag => tag.trim())
                                            .filter(tag => tag.length > 0)
                                        setValue('tags', tags)
                                    }}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Separate tags with commas
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="content" className="space-y-6">
                    {currentCourseId ? (
                        <SectionManager courseId={currentCourseId} sections={course?.sections || []} />
                    ) : (
                        <Card>
                            <CardContent className="pt-6">
                                <p className="text-center text-muted-foreground">
                                    Save the course details first to add content
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </form>
    )
}
