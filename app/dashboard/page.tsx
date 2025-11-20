'use client'

import { ProtectedRoute } from '@/components/shared/protected-route'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { useAuth } from '@/contexts/auth'
import { UserRoleBadge, RoleBasedContent } from '@/components/shared/role-based-components'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Settings, Users } from 'lucide-react'

export default function DashboardPage() {
  const { profile, isSuperAdmin, isAdmin } = useAuth()

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header with Role Badge */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Welcome back, {profile?.full_name || profile?.email}
              </p>
            </div>
            <UserRoleBadge />
          </div>

          {/* Quick Actions for Admins */}
          {(isSuperAdmin() || isAdmin()) && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="flex gap-3">
                {isSuperAdmin() && (
                  <Link href="/admin/users">
                    <Button>
                      <Users className="w-4 h-4 mr-2" />
                      Manage Users
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard/profile">
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Role-Based Content */}
          <RoleBasedContent />

          {/* Default Content */}
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-muted-foreground">
              Select a section from the sidebar to get started
            </p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}