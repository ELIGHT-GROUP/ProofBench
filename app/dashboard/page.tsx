'use client'

import { ProtectedRoute } from '@/components/ui/protected-route'
import { useAuth } from '@/contexts/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, signOut } = useAuth()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  ProofBench Dashboard
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  Welcome, {user?.user_metadata?.full_name || user?.email}
                </span>
                <Button onClick={signOut} variant="outline">
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Profile
              </h2>
              <p className="text-gray-600 mb-4">
                Manage your account settings and preferences
              </p>
              <Link href="/dashboard/profile">
                <Button className="w-full">
                  View Profile
                </Button>
              </Link>
            </div>

            {/* Exams Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Exams
              </h2>
              <p className="text-gray-600 mb-4">
                Browse available exams and track your progress
              </p>
              <Link href="/dashboard/exams">
                <Button className="w-full">
                  Browse Exams
                </Button>
              </Link>
            </div>

            {/* Analytics Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Analytics
              </h2>
              <p className="text-gray-600 mb-4">
                View your learning analytics and performance metrics
              </p>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recent Activity
              </h2>
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No recent activity. Start by taking an exam!
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}