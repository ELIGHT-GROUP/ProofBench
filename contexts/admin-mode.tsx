'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth'
import { adminMenuItems } from '@/constants/dashboard' // Assuming this is the 'menuItems' referred to
import { menuItems } from '@/constants/dashboard' // Assuming a 'menuItems' constant exists for regular users

interface AdminModeContextType {
    adminModeEnabled: boolean
    toggleAdminMode: () => void
    canAccessAdminMode: () => boolean
}

const AdminModeContext = createContext<AdminModeContextType | undefined>(undefined)

const ADMIN_MODE_STORAGE_KEY = 'proofbench-admin-mode'

export function AdminModeProvider({ children }: { children: ReactNode }) {
    const { isAdmin, isSuperAdmin } = useAuth()
    const [adminModeEnabled, setAdminModeEnabled] = useState(false)
    const router = useRouter()

    // Load admin mode preference from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(ADMIN_MODE_STORAGE_KEY)

            // If user can access admin mode
            if (isAdmin() || isSuperAdmin()) {
                // If no stored preference, default to admin mode (true)
                // Otherwise use stored preference
                if (stored === null) {
                    setAdminModeEnabled(true)
                    localStorage.setItem(ADMIN_MODE_STORAGE_KEY, 'true')
                } else {
                    setAdminModeEnabled(stored === 'true')
                }
            } else {
                // If user cannot access admin mode, ensure it's disabled in state and storage
                if (adminModeEnabled) { // Only update if currently enabled
                    setAdminModeEnabled(false);
                    localStorage.setItem(ADMIN_MODE_STORAGE_KEY, 'false');
                }
            }
        }
    }, [isAdmin, isSuperAdmin, adminModeEnabled]) // Added adminModeEnabled to dependencies for cleanup

    // Navigate when admin mode state changes
    useEffect(() => {
        let route_path: string;
        if (adminModeEnabled) {
            // When admin mode is enabled, navigate to the first admin menu item
            route_path = adminMenuItems[0].href;
        } else {
            // When admin mode is disabled, navigate to the first regular menu item
            // Assuming 'menuItems' is a constant containing regular user menu items.
            // If 'menuItems' is not defined, you might want to default to '/' or a specific non-admin page.
            route_path = menuItems[0].href; // Or provide a fallback like '/'
        }
        router.push(route_path);
    }, [adminModeEnabled, router])

    // Check if user can access admin mode
    const canAccessAdminMode = () => {
        return isAdmin() || isSuperAdmin()
    }

    // Toggle admin mode
    const toggleAdminMode = () => {
        if (!canAccessAdminMode()) {
            console.warn('User does not have permission to access admin mode')
            return
        }

        setAdminModeEnabled(prev => {
            const newValue = !prev
            // Persist to localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem(ADMIN_MODE_STORAGE_KEY, String(newValue))
            }
            return newValue
        })
    }

    const value = {
        adminModeEnabled: adminModeEnabled && canAccessAdminMode(), // Double check permission
        toggleAdminMode,
        canAccessAdminMode,
    }

    return <AdminModeContext.Provider value={value}>{children}</AdminModeContext.Provider>
}

export const useAdminMode = () => {
    const context = useContext(AdminModeContext)
    if (context === undefined) {
        throw new Error('useAdminMode must be used within an AdminModeProvider')
    }
    return context
}
