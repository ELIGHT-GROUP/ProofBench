'use client'

import type { SectionWithVideos, VideoWithProgress } from '@/lib/supabase/courses/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckCircle2, Circle, PlayCircle, Clock } from 'lucide-react'
import { formatDuration } from '@/lib/utils/video-utils'
import { cn } from '@/lib/utils'

interface CoursePlaylistProps {
    sections: SectionWithVideos[]
    currentVideo: VideoWithProgress | null
    onVideoSelect: (video: VideoWithProgress) => void
}

export function CoursePlaylist({ sections, currentVideo, onVideoSelect }: CoursePlaylistProps) {
    const getVideoStatusIcon = (video: VideoWithProgress) => {
        if (video.progress?.completed) {
            return <CheckCircle2 className="h-4 w-4 text-green-500" />
        } else if (video.progress && video.progress.watch_percentage > 0) {
            return <PlayCircle className="h-4 w-4 text-primary" />
        } else {
            return <Circle className="h-4 w-4 text-muted-foreground" />
        }
    }

    const totalVideos = sections.reduce((acc, section) => acc + section.videos.length, 0)
    const completedVideos = sections.reduce(
        (acc, section) => acc + section.videos.filter(v => v.progress?.completed).length,
        0
    )

    return (
        <Card className="h-fit lg:sticky lg:top-4">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Course Content</span>
                    <Badge variant="secondary">
                        {completedVideos}/{totalVideos}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                    <Accordion type="multiple" defaultValue={sections.map(s => s.id)} className="px-4">
                        {sections.map((section, sectionIndex) => {
                            const sectionCompleted = section.videos.filter(v => v.progress?.completed).length
                            const sectionTotal = section.videos.length

                            return (
                                <AccordionItem key={section.id} value={section.id}>
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex items-center justify-between w-full pr-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">{section.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {sectionCompleted}/{sectionTotal}
                                                </Badge>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-1 pt-2">
                                            {section.videos.map((video, videoIndex) => {
                                                const isCurrentVideo = currentVideo?.id === video.id

                                                return (
                                                    <button
                                                        key={video.id}
                                                        onClick={() => onVideoSelect(video)}
                                                        className={cn(
                                                            'w-full text-left px-3 py-2.5 rounded-md transition-colors',
                                                            'hover:bg-accent/50',
                                                            isCurrentVideo && 'bg-primary/10 border-l-2 border-primary'
                                                        )}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="mt-0.5">
                                                                {getVideoStatusIcon(video)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className={cn(
                                                                    'text-sm font-medium line-clamp-2',
                                                                    isCurrentVideo && 'text-primary'
                                                                )}>
                                                                    {video.title}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    {video.duration && (
                                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                                            <Clock className="h-3 w-3" />
                                                                            <span>{formatDuration(video.duration)}</span>
                                                                        </div>
                                                                    )}
                                                                    {video.progress && video.progress.watch_percentage > 0 && !video.progress.completed && (
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {video.progress.watch_percentage}%
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        })}
                    </Accordion>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
