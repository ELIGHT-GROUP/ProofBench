'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

interface CommentFormProps {
    onSubmit: (content: string) => Promise<void>
    onCancel?: () => void
    placeholder?: string
    submitLabel?: string
    initialValue?: string
    autoFocus?: boolean
}

export function CommentForm({
    onSubmit,
    onCancel,
    placeholder = 'Write a comment...',
    submitLabel = 'Comment',
    initialValue = '',
    autoFocus = false,
}: CommentFormProps) {
    const [content, setContent] = useState(initialValue)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim() || isSubmitting) return

        try {
            setIsSubmitting(true)
            await onSubmit(content.trim())
            setContent('')
        } catch (error) {
            console.error('Error submitting comment:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        setContent(initialValue)
        onCancel?.()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                className="min-h-[30px] resize-none"
                disabled={isSubmitting}
                autoFocus={autoFocus}
            />
            <div className="flex items-center gap-2">
                <Button
                    type="submit"
                    disabled={!content.trim() || isSubmitting}
                    size="sm"
                >
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {submitLabel}
                </Button>
                {onCancel && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    )
}
