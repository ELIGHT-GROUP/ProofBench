'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/auth'
import { useAdminMode } from '@/contexts/admin-mode'
import { LogOut, Menu, Shield } from 'lucide-react'
import { ThemeToggle } from '../shared/theme-toggle'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
    onMenuClick: () => void
}

export const DashboardHeader = ({ onMenuClick }: DashboardHeaderProps) => {
    const { user, signOut, isAdmin, isSuperAdmin } = useAuth()
    const { adminModeEnabled, toggleAdminMode, canAccessAdminMode } = useAdminMode()

    // Get user initials for avatar fallback
    const getUserInitials = () => {
        const name = user?.user_metadata?.full_name || user?.email || 'User'
        return name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="flex h-16 items-center gap-4 px-4 md:px-6">
                {/* Mobile menu button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={onMenuClick}
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                </Button>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Theme Toggle  */}
                <ThemeToggle />

                {/* Admin Mode Toggle - Only visible to admins/superadmins */}
                {canAccessAdminMode() && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleAdminMode}
                        title={adminModeEnabled ? "Disable Admin Mode" : "Enable Admin Mode"}

                    >
                        <Shield className={cn(
                            "transition-all w-5 h-5",
                            adminModeEnabled && "text-primary font-bold"
                        )} />
                    </Button>
                )}

                {/* User profile dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10">
                                <AvatarImage
                                    src={user?.user_metadata?.avatar_url}
                                    alt={user?.user_metadata?.full_name || user?.email || 'User'}
                                />
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                    {getUserInitials()}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {user?.user_metadata?.full_name || 'User'}
                                </p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:text-destructive"
                            onClick={signOut}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
