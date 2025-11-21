
import { UserManagement } from '@/components/admin/user-management'

export default function UsersPage() {
    return (

        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground mt-2">
                    Manage user roles and permissions
                </p>
            </div>

            <UserManagement />
        </div>

    )
}
