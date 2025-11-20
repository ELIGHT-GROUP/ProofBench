'use client'

import { ProtectedRoute } from '@/components/shared/protected-route'
import { UserManagement } from '@/components/admin/user-management'
import { useAuth } from '@/contexts/auth'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Users, GraduationCap } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getUsersByRole } from '@/lib/supabase/profiles'

export default function AdminUsersPage() {
    const { profile } = useAuth()
    const [stats, setStats] = useState({
        superadmins: 0,
        admins: 0,
        students: 0
    })

    useEffect(() => {
        const fetchStats = async () => {
            const [superadmins, admins, students] = await Promise.all([
                getUsersByRole('superadmin'),
                getUsersByRole('admin'),
                getUsersByRole('student')
            ])
            setStats({
                superadmins: superadmins.length,
                admins: admins.length,
                students: students.length
            })
        }
        fetchStats()
    }, [])

    return (
        <ProtectedRoute allowedRoles={['superadmin']}>
            <div className="container mx-auto py-8 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">User Management</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage user roles and permissions across the platform
                        </p>
                    </div>
                    <Badge className="bg-purple-500 text-white">
                        <ShieldCheck className="w-4 h-4 mr-1" />
                        Super Admin
                    </Badge>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Super Admins</p>
                                <p className="text-3xl font-bold mt-1">{stats.superadmins}</p>
                            </div>
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                                <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Admins</p>
                                <p className="text-3xl font-bold mt-1">{stats.admins}</p>
                            </div>
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Students</p>
                                <p className="text-3xl font-bold mt-1">{stats.students}</p>
                            </div>
                            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                                <GraduationCap className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* User Management Table */}
                <UserManagement />

                {/* Info Card */}
                <Card className="p-6 bg-muted/50">
                    <h3 className="font-semibold mb-2">Role Management Guidelines</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• <strong>Super Admin:</strong> Full system access, can manage all users and roles</li>
                        <li>• <strong>Admin:</strong> Can view all users and manage students</li>
                        <li>• <strong>Student:</strong> Default role for new users, limited access</li>
                        <li>• You cannot change your own role for security reasons</li>
                        <li>• The first user to sign up is automatically assigned Super Admin role</li>
                    </ul>
                </Card>
            </div>
        </ProtectedRoute>
    )
}
