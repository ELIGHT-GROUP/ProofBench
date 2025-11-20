'use client'

import { useAuth } from '@/contexts/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import PageLoader from './PageLoader'
import { UserRole } from '@/lib/supabase/types'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[] // Optional: restrict access to specific roles
  redirectTo?: string // Optional: custom redirect path
}

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { user, profile, loading, profileLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait for both auth and profile to load
    if (loading || profileLoading) return

    // Redirect to login if not authenticated
    if (!user) {
      router.push(redirectTo)
      return
    }

    // If allowedRoles is specified, check if user has permission
    if (allowedRoles && allowedRoles.length > 0 && profile) {
      if (!allowedRoles.includes(profile.role)) {
        // Redirect to dashboard or unauthorized page
        router.push('/dashboard')
      }
    }
  }, [user, profile, loading, profileLoading, router, allowedRoles, redirectTo])

  // Show loader while checking authentication and profile
  if (loading || profileLoading) {
    return <PageLoader />
  }

  // Don't render if not authenticated
  if (!user) {
    return null // Will redirect via useEffect
  }

  // Don't render if user doesn't have required role
  if (allowedRoles && allowedRoles.length > 0 && profile) {
    if (!allowedRoles.includes(profile.role)) {
      return null // Will redirect via useEffect
    }
  }

  return <>{children}</>
}