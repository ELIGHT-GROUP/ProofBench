'use client'

import { ProtectedRoute } from '@/components/shared/protected-route'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { UserManagement } from '@/components/admin/user-management'

export default function UsersPage() {
    return (
        <ProtectedRoute allowedRoles={['superadmin']}>
            <DashboardLayout>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage user roles and permissions
                        </p>
                    </div>

                    <UserManagement />
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    )
}
