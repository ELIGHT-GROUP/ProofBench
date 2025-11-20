'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from './auth'

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

    // Load admin mode preference from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(ADMIN_MODE_STORAGE_KEY)
            if (stored === 'true' && (isAdmin() || isSuperAdmin())) {
                setAdminModeEnabled(true)
            }
        }
    }, [isAdmin, isSuperAdmin])

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
