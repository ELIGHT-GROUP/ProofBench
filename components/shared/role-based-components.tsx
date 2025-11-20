'use client'

import { useAuth } from '@/contexts/auth'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, ShieldCheck, User } from 'lucide-react'

export function UserRoleBadge() {
    const { profile } = useAuth()

    if (!profile) return null

    const roleConfig = {
        superadmin: {
            label: 'Super Admin',
            icon: ShieldCheck,
            className: 'bg-purple-500 text-white hover:bg-purple-600'
        },
        admin: {
            label: 'Admin',
            icon: Shield,
            className: 'bg-blue-500 text-white hover:bg-blue-600'
        },
        student: {
            label: 'Student',
            icon: User,
            className: 'bg-green-500 text-white hover:bg-green-600'
        }
    }

    const config = roleConfig[profile.role]
    const Icon = config.icon

    return (
        <Badge className={config.className}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
        </Badge>
    )
}

export function RoleBasedContent() {
    const { profile, isSuperAdmin, isAdmin, isStudent } = useAuth()

    if (!profile) return null

    return (
        <div className="space-y-4">
            {/* Content visible to all authenticated users */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">Welcome, {profile.full_name || profile.email}!</h3>
                <p className="text-muted-foreground">Your role: <UserRoleBadge /></p>
            </Card>

            {/* Content visible to Students */}
            {isStudent() && (
                <Card className="p-6 border-green-500">
                    <h3 className="text-lg font-semibold mb-2">Student Dashboard</h3>
                    <p className="text-muted-foreground">Access your courses and assignments here.</p>
                </Card>
            )}

            {/* Content visible to Admins and SuperAdmins */}
            {isAdmin() && (
                <Card className="p-6 border-blue-500">
                    <h3 className="text-lg font-semibold mb-2">Admin Panel</h3>
                    <p className="text-muted-foreground">Manage students and view reports.</p>
                    <Button className="mt-4">View All Users</Button>
                </Card>
            )}

            {/* Content visible only to SuperAdmins */}
            {isSuperAdmin() && (
                <Card className="p-6 border-purple-500">
                    <h3 className="text-lg font-semibold mb-2">Super Admin Controls</h3>
                    <p className="text-muted-foreground">Full system access and user role management.</p>
                    <div className="flex gap-2 mt-4">
                        <Button>Manage Roles</Button>
                        <Button variant="outline">System Settings</Button>
                    </div>
                </Card>
            )}
        </div>
    )
}
