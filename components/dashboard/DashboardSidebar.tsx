'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Logo from '@/components/shared/Logo'
import { useAdminMode } from '@/contexts/admin-mode'
import { useAuth } from '@/contexts/auth'
import { menuItems, adminMenuItems } from '@/constants/dashboard'
import Image from 'next/image'

interface DashboardSidebarProps {
    isOpen: boolean
    onClose: () => void
}

export const DashboardSidebar = ({ isOpen, onClose }: DashboardSidebarProps) => {
    const pathname = usePathname()
    const { adminModeEnabled } = useAdminMode()
    const { profile, hasRole } = useAuth()

    // Filter admin menu items based on user role
    const visibleAdminItems = adminMenuItems.filter(item => {
        if (!item.requiredRoles) return true
        return hasRole(item.requiredRoles)
    })

    // Show ONLY admin sections when in admin mode, ONLY student sections when in student mode
    const allMenuItems = adminModeEnabled
        ? visibleAdminItems  // Admin mode: show only admin sections
        : menuItems          // Student mode: show only student sections

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
                        <div className="flex items-center gap-2">
                            <Logo />
                        </div>
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
                        {allMenuItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onClose}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors',
                                        'hover:bg-accent hover:text-accent-foreground',
                                        isActive
                                            ? 'bg-primary/10 text-accent-foreground hover:bg-primary/25 border-l-2 border-primary'
                                            : 'text-muted-foreground',
                                        item.adminOnly && ''
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{item.title}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="border-t flex py-2 px-3 flex-row justify-between items-center gap-2 bg-muted">
                        <div className="">
                            <p className="text-xs text-muted-foreground">
                                ProofBench
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Version 1.0.0
                            </p>
                        </div>

                        <Link
                            href="https://github.com/ELIGHT-GROUP"
                            target='_blank'
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors"
                        >
                            <Image
                                src="/elight.png"
                                alt="Elight-Group"
                                width={40}
                                height={40}
                                className='rounded-full'
                            />
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    )
}
