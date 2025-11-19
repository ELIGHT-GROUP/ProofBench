'use client'

import { ProtectedRoute } from '@/components/ui/protected-route'
import { useAuth } from '@/contexts/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, signOut } = useAuth()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="outline">
                    ← Dashboard
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                  Profile
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  {user?.user_metadata?.full_name || user?.email}
                </span>
                <Button onClick={signOut} variant="outline">
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Account Information
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="text-gray-900 text-lg">
                  {user?.user_metadata?.full_name || 'Not provided'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="text-gray-900 text-lg">
                  {user?.email}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Created
                </label>
                <div className="text-gray-900 text-lg">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Sign In
                </label>
                <div className="text-gray-900 text-lg">
                  {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Account Actions
              </h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full sm:w-auto">
                  Update Profile
                </Button>
                <Button variant="outline" className="w-full sm:w-auto ml-0 sm:ml-4">
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}