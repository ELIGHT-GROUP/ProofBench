'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { UserProfile, UserRole } from '@/lib/supabase/profiles'
import { getCurrentUserProfile, hasRole, isSuperAdmin, isAdmin, isStudent } from '@/lib/supabase/profiles'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  profileLoading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  hasRole: (allowedRoles: UserRole[]) => boolean
  isSuperAdmin: () => boolean
  isAdmin: () => boolean
  isStudent: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(true)

  // Fetch user profile with retry logic for new user race condition
  const fetchProfile = async (retryCount = 0, maxRetries = 3) => {
    setProfileLoading(true)
    try {
      const userProfile = await getCurrentUserProfile()

      // If profile doesn't exist and we have retries left, wait and try again
      // This handles the race condition where the trigger hasn't created the profile yet
      if (!userProfile && retryCount < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 4000) // Exponential backoff, max 4s
        console.log(`Profile not found, retrying in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries})`)

        await new Promise(resolve => setTimeout(resolve, delay))
        return fetchProfile(retryCount + 1, maxRetries)
      }

      setProfile(userProfile)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
    } finally {
      setProfileLoading(false)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)

      // Fetch profile if user exists
      if (session?.user) {
        fetchProfile()
      } else {
        setProfileLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)

      // Fetch profile when user signs in
      if (session?.user) {
        fetchProfile()
      } else {
        setProfile(null)
        setProfileLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
    if (error) {
      console.error('Error signing in with Google:', error.message)
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error.message)
    } else {
      setProfile(null)
    }
  }

  const refreshProfile = async () => {
    await fetchProfile(0) // Start with fresh retry count
  }

  const value = {
    user,
    profile,
    loading,
    profileLoading,
    signInWithGoogle,
    signOut,
    refreshProfile,
    hasRole: (allowedRoles: UserRole[]) => hasRole(profile?.role, allowedRoles),
    isSuperAdmin: () => isSuperAdmin(profile?.role),
    isAdmin: () => isAdmin(profile?.role),
    isStudent: () => isStudent(profile?.role),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}