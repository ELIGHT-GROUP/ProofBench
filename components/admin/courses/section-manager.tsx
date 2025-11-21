'use client'

import { useState } from 'react'
import type { SectionWithVideos } from '@/lib/supabase/courses/types'
import { createSection, deleteSection, updateSection } from '@/lib/supabase/courses'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
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
import { Plus, Trash2, Pencil, GripVertical, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { VideoManager } from './video-manager'

interface SectionManagerProps {
    courseId: string
    sections: SectionWithVideos[]
}

export function SectionManager({ courseId, sections: initialSections }: SectionManagerProps) {
    const [sections, setSections] = useState<SectionWithVideos[]>(initialSections)
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null)
    const [editingSectionName, setEditingSectionName] = useState('')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [sectionToDelete, setSectionToDelete] = useState<SectionWithVideos | null>(null)
    const [adding, setAdding] = useState(false)
    const [newSectionName, setNewSectionName] = useState('')

    async function handleAddSection() {
        if (!newSectionName.trim()) {
            toast.error('Section name is required')
            return
        }

        try {
            const newSection = await createSection(courseId, {
                name: newSectionName,
                order_index: sections.length,
            })

            setSections([...sections, { ...newSection, videos: [] }])
            setNewSectionName('')
            setAdding(false)
            toast.success('Section added')
        } catch (error) {
            console.error('Error adding section:', error)
            toast.error('Failed to add section')
        }
    }

    async function handleUpdateSection(sectionId: string, name: string) {
        try {
            await updateSection(sectionId, { name })
            setSections(sections.map(s =>
                s.id === sectionId ? { ...s, name } : s
            ))
            setEditingSectionId(null)
            toast.success('Section updated')
        } catch (error) {
            console.error('Error updating section:', error)
            toast.error('Failed to update section')
        }
    }

    async function handleDeleteSection() {
        if (!sectionToDelete) return

        try {
            await deleteSection(sectionToDelete.id)
            setSections(sections.filter(s => s.id !== sectionToDelete.id))
            setDeleteDialogOpen(false)
            setSectionToDelete(null)
            toast.success('Section deleted')
        } catch (error) {
            console.error('Error deleting section:', error)
            toast.error('Failed to delete section')
        }
    }

    function openDeleteDialog(section: SectionWithVideos) {
        setSectionToDelete(section)
        setDeleteDialogOpen(true)
    }

    function startEditing(section: SectionWithVideos) {
        setEditingSectionId(section.id)
        setEditingSectionName(section.name)
    }

    function cancelEditing() {
        setEditingSectionId(null)
        setEditingSectionName('')
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Course Content</CardTitle>
                    <Button onClick={() => setAdding(true)} disabled={adding}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Section
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {adding && (
                    <Card className="border-2 border-primary">
                        <CardContent className="pt-6">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Section name..."
                                    value={newSectionName}
                                    onChange={(e) => setNewSectionName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
                                    autoFocus
                                />
                                <Button onClick={handleAddSection} size="icon">
                                    <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        setAdding(false)
                                        setNewSectionName('')
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {sections.length === 0 && !adding ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No sections yet. Add your first section to start organizing content.
                    </div>
                ) : (
                    <Accordion type="multiple" defaultValue={sections.map(s => s.id)}>
                        {sections.map((section, index) => (
                            <AccordionItem key={section.id} value={section.id}>
                                <div className="flex items-center gap-2 pr-2">
                                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                    <div className="flex-1 flex items-center gap-2">
                                        {editingSectionId === section.id ? (
                                            <div className="flex items-center gap-2 flex-1 py-2">
                                                <Input
                                                    value={editingSectionName}
                                                    onChange={(e) => setEditingSectionName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleUpdateSection(section.id, editingSectionName)
                                                        } else if (e.key === 'Escape') {
                                                            cancelEditing()
                                                        }
                                                    }}
                                                    className="flex-1"
                                                    autoFocus
                                                />
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => handleUpdateSection(section.id, editingSectionName)}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={cancelEditing}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <AccordionTrigger className="hover:no-underline flex-1 py-2">
                                                    <span className="font-medium">{section.name}</span>
                                                </AccordionTrigger>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-muted-foreground">
                                                        {section.videos.length} videos
                                                    </span>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => startEditing(section)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => openDeleteDialog(section)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <AccordionContent>
                                    <VideoManager sectionId={section.id} initialVideos={section.videos} />
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}

                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Section</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete "{sectionToDelete?.name}"? This will also delete all videos in this section.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setSectionToDelete(null)}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDeleteSection}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
    )
}
