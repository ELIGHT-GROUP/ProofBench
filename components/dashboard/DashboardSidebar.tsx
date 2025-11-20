'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { FileText, Home, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Logo from '@/components/shared/Logo'

interface DashboardSidebarProps {
    isOpen: boolean
    onClose: () => void
}

const menuItems = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: Home,
    },
    {
        title: 'Test',
        href: '/dashboard/test',
        icon: FileText,
    },
    {
        title: 'Profile',
        href: '/dashboard/profile',
        icon: User,
    },
]

export const DashboardSidebar = ({ isOpen, onClose }: DashboardSidebarProps) => {
    const pathname = usePathname()

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-50 h-full w-64 border-r bg-background transition-transform duration-300 ease-in-out md:sticky md:top-0 md:z-30 md:translate-x-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex h-16 items-center justify-between border-b px-6">
                        <Logo />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={onClose}
                        >
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close menu</span>
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 p-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onClose}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                        'hover:bg-accent hover:text-accent-foreground',
                                        isActive
                                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                            : 'text-muted-foreground'
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{item.title}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="border-t p-2">
                        <div className="rounded-lg bg-muted p-3">
                            <p className="text-xs text-muted-foreground">
                                ProofBench
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Version 1.0.0
                            </p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}
