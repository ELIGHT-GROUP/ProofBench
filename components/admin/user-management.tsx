'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/contexts/auth'
import { getAllUsers, updateUserRole, UserProfile, UserRole } from '@/lib/supabase/profiles'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { RefreshCw, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { roleConfig } from '@/constants/roles'

export function UserManagement() {
    const { profile, isSuperAdmin, isAdmin } = useAuth()
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

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
        if (isSuperAdmin() || isAdmin()) {
            fetchUsers()
        }
    }, [])

    // Filter and paginate users
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const query = searchQuery.toLowerCase()
            return (
                user.email.toLowerCase().includes(query) ||
                (user.full_name?.toLowerCase().includes(query) ?? false)
            )
        })
    }, [users, searchQuery])

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    // Reset to page 1 when search query changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery])

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
        const config = roleConfig[role]
        const Icon = config.icon
        return (
            <Badge className={config.className}>
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
            </Badge>
        )
    }

    if (!isSuperAdmin() && !isAdmin()) {
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
            <div className="space-y-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by email or name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                            setItemsPerPage(Number(value))
                            setCurrentPage(1)
                        }}>
                            <SelectTrigger className="w-[100px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={fetchUsers} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
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
                        {paginatedUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.email}</TableCell>
                                <TableCell>{user.full_name || '-'}</TableCell>
                                <TableCell>{getRoleBadge(user.role)}</TableCell>
                                <TableCell>
                                    {user.role === 'superadmin' ? (
                                        <p className="text-sm text-muted-foreground">Role protected</p>
                                    ) : (
                                        <>
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
                                                </SelectContent>
                                            </Select>
                                            {user.id === profile?.id && (
                                                <p className="text-xs text-muted-foreground mt-1">Cannot change own role</p>
                                            )}
                                        </>
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

            {filteredUsers.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                        Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                    </p>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </Button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => {
                                    // Show first page, last page, current page, and pages around current
                                    return page === 1 ||
                                        page === totalPages ||
                                        Math.abs(page - currentPage) <= 1
                                })
                                .map((page, idx, arr) => (
                                    <div key={page} className="flex items-center">
                                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                                            <span className="px-2 text-muted-foreground">...</span>
                                        )}
                                        <Button
                                            variant={currentPage === page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setCurrentPage(page)}
                                            className="w-10"
                                        >
                                            {page}
                                        </Button>
                                    </div>
                                ))}
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No users found matching your search' : 'No users found'}
                </div>
            )}
        </Card>
    )
}
