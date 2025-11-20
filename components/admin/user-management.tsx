'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth'
import { UserProfile, UserRole } from '@/lib/supabase/types'
import { getAllUsers, updateUserRole } from '@/lib/supabase/profiles'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Shield, ShieldCheck, User, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export function UserManagement() {
    const { profile, isSuperAdmin } = useAuth()
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState<string | null>(null)

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const allUsers = await getAllUsers()
            setUsers(allUsers)
        } catch (error) {
            console.error('Error fetching users:', error)
            toast.error('Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isSuperAdmin()) {
            fetchUsers()
        }
    }, [])

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        // Prevent changing own role
        if (userId === profile?.id) {
            toast.error('You cannot change your own role')
            return
        }

        setUpdating(userId)
        try {
            const updated = await updateUserRole(userId, newRole)
            if (updated) {
                toast.success(`Role updated to ${newRole}`)
                // Update local state
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
            } else {
                toast.error('Failed to update role')
            }
        } catch (error) {
            console.error('Error updating role:', error)
            toast.error('Failed to update role')
        } finally {
            setUpdating(null)
        }
    }

    const getRoleBadge = (role: UserRole) => {
        const config = {
            superadmin: { label: 'Super Admin', icon: ShieldCheck, className: 'bg-purple-500 text-white' },
            admin: { label: 'Admin', icon: Shield, className: 'bg-blue-500 text-white' },
            student: { label: 'Student', icon: User, className: 'bg-green-500 text-white' }
        }
        const { label, icon: Icon, className } = config[role]
        return (
            <Badge className={className}>
                <Icon className="w-3 h-3 mr-1" />
                {label}
            </Badge>
        )
    }

    if (!isSuperAdmin()) {
        return (
            <Card className="p-6">
                <p className="text-muted-foreground">You don't have permission to view this page.</p>
            </Card>
        )
    }

    if (loading) {
        return (
            <Card className="p-6">
                <div className="flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading users...</span>
                </div>
            </Card>
        )
    }

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold">User Management</h2>
                    <p className="text-muted-foreground">Manage user roles and permissions</p>
                </div>
                <Button onClick={fetchUsers} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Current Role</TableHead>
                            <TableHead>Change Role</TableHead>
                            <TableHead>Joined</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.email}</TableCell>
                                <TableCell>{user.full_name || '-'}</TableCell>
                                <TableCell>{getRoleBadge(user.role)}</TableCell>
                                <TableCell>
                                    <Select
                                        value={user.role}
                                        onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                                        disabled={updating === user.id || user.id === profile?.id}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="student">Student</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="superadmin">Super Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {user.id === profile?.id && (
                                        <p className="text-xs text-muted-foreground mt-1">Cannot change own role</p>
                                    )}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {users.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    No users found
                </div>
            )}
        </Card>
    )
}
