'use client'

import type { VideoResource } from '@/lib/supabase/courses/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Link2, Code, Download, ExternalLink } from 'lucide-react'

interface VideoResourcesProps {
    resources: VideoResource[]
}

export function VideoResources({ resources }: VideoResourcesProps) {
    const getResourceIcon = (type: string) => {
        switch (type) {
            case 'pdf':
                return <FileText className="h-4 w-4" />
            case 'code':
                return <Code className="h-4 w-4" />
            case 'notes':
                return <FileText className="h-4 w-4" />
            default:
                return <Link2 className="h-4 w-4" />
        }
    }

    const getResourceColor = (type: string) => {
        switch (type) {
            case 'pdf':
                return 'text-red-500'
            case 'code':
                return 'text-blue-500'
            case 'notes':
                return 'text-yellow-500'
            default:
                return 'text-gray-500'
        }
    }

    if (resources.length === 0) {
        return null
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Resources</CardTitle>
                <CardDescription>
                    Additional materials for this video
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {resources.map((resource) => (
                        <a
                            key={resource.id}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className={getResourceColor(resource.type)}>
                                    {getResourceIcon(resource.type)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{resource.title}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{resource.type}</p>
                                </div>
                            </div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                        </a>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
