# Role-Based Authentication - Quick Reference

## 🎯 Three Roles

| Role           | Description        | How to Get             |
| -------------- | ------------------ | ---------------------- |
| **SuperAdmin** | Full system access | First user to sign up  |
| **Admin**      | Manage students    | Promoted by SuperAdmin |
| **Student**    | Limited access     | Default for new users  |

## 🔑 Auth Context API

```tsx
import { useAuth } from "@/contexts/auth";

const {
  user, // Supabase user object
  profile, // User profile with role
  loading, // Auth loading state
  profileLoading, // Profile loading state

  // Methods
  signInWithGoogle,
  signOut,
  refreshProfile,

  // Role Checkers
  isSuperAdmin, // () => boolean
  isAdmin, // () => boolean
  isStudent, // () => boolean
  hasRole, // (roles: UserRole[]) => boolean
} = useAuth();
```

## 🛡️ Protected Routes

### Basic Protection (Any authenticated user)

```tsx
<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>
```

### Role-Based Protection

```tsx
<ProtectedRoute allowedRoles={['superadmin']}>
  <SuperAdminOnly />
</ProtectedRoute>

<ProtectedRoute allowedRoles={['admin', 'superadmin']}>
  <AdminAndSuperAdmin />
</ProtectedRoute>
```

## 🎨 Conditional Rendering

### Using Role Checkers

```tsx
const { isSuperAdmin, isAdmin, isStudent } = useAuth();

{
  isSuperAdmin() && <SuperAdminPanel />;
}
{
  isAdmin() && <AdminPanel />;
}
{
  isStudent() && <StudentDashboard />;
}
```

### Using hasRole

```tsx
const { hasRole } = useAuth();

{
  hasRole(["admin", "superadmin"]) && <AdminFeature />;
}
```

### Using Profile Directly

```tsx
const { profile } = useAuth();

{
  profile?.role === "superadmin" && <SuperAdminFeature />;
}
```

## 📊 Profile Functions

```tsx
import {
  getCurrentUserProfile,
  getUserProfile,
  updateUserProfile,
  updateUserRole,
  getAllUsers,
  getUsersByRole,
} from "@/lib/supabase/profiles";

// Get current user's profile
const profile = await getCurrentUserProfile();

// Get specific user's profile
const userProfile = await getUserProfile(userId);

// Update profile (except role)
await updateUserProfile(userId, {
  full_name: "John Doe",
  avatar_url: "https://...",
});

// Update role (SuperAdmin only)
await updateUserRole(userId, "admin");

// Get all users
const allUsers = await getAllUsers();

// Get users by role
const students = await getUsersByRole("student");
const admins = await getUsersByRole("admin");
```

## 🎭 Role Helper Functions

```tsx
import {
  hasRole,
  isSuperAdmin,
  isAdmin,
  isStudent,
} from "@/lib/supabase/profiles";

// Check if user has specific role
if (hasRole(userRole, ["admin", "superadmin"])) {
  // User is admin or superadmin
}

// Check specific roles
if (isSuperAdmin(userRole)) {
  /* ... */
}
if (isAdmin(userRole)) {
  /* ... */
}
if (isStudent(userRole)) {
  /* ... */
}
```

## 🧩 UI Components

### UserRoleBadge

```tsx
import { UserRoleBadge } from "@/components/shared/role-based-components";

<UserRoleBadge />;
// Displays: "Super Admin" | "Admin" | "Student"
```

### RoleBasedContent

```tsx
import { RoleBasedContent } from "@/components/shared/role-based-components";

<RoleBasedContent />;
// Shows different content based on user's role
```

### UserManagement

```tsx
import { UserManagement } from "@/components/admin/user-management";

<UserManagement />;
// Full user management interface (SuperAdmin only)
```

## 📄 Page Examples

### Admin Page with Protection

```tsx
// app/admin/users/page.tsx
import { ProtectedRoute } from "@/components/shared/protected-route";
import { UserManagement } from "@/components/admin/user-management";

export default function AdminUsersPage() {
  return (
    <ProtectedRoute allowedRoles={["superadmin"]}>
      <UserManagement />
    </ProtectedRoute>
  );
}
```

### Dashboard with Role Content

```tsx
// app/dashboard/page.tsx
import { useAuth } from "@/contexts/auth";
import { UserRoleBadge } from "@/components/shared/role-based-components";

export default function Dashboard() {
  const { profile, isSuperAdmin } = useAuth();

  return (
    <div>
      <h1>Welcome, {profile?.full_name}</h1>
      <UserRoleBadge />

      {isSuperAdmin() && <Link href="/admin/users">Manage Users</Link>}
    </div>
  );
}
```

## 🗄️ Database Queries

### Get All Users with Roles

```sql
SELECT email, role, created_at
FROM profiles
ORDER BY created_at;
```

### Count Users by Role

```sql
SELECT role, COUNT(*)
FROM profiles
GROUP BY role;
```

### Find SuperAdmins

```sql
SELECT email, full_name
FROM profiles
WHERE role = 'superadmin';
```

### Update User Role

```sql
UPDATE profiles
SET role = 'admin'
WHERE id = 'user-id-here';
```

## 🔐 Security Best Practices

### ✅ DO

- Use `ProtectedRoute` for all authenticated pages
- Use `allowedRoles` prop for role-specific pages
- Check roles on both client and server
- Use RLS policies in Supabase
- Validate role changes server-side

### ❌ DON'T

- Trust client-side role checks alone
- Allow users to change their own role
- Hardcode user IDs
- Skip RLS policies
- Expose sensitive data to students

## 🐛 Common Issues

### Profile is null

```tsx
const { profile, profileLoading } = useAuth();

if (profileLoading) return <Loading />;
if (!profile) return <Error />;

// Safe to use profile here
```

### Role not updating in UI

```tsx
const { refreshProfile } = useAuth();

// After role change
await updateUserRole(userId, "admin");
await refreshProfile(); // Refresh current user's profile
```

### Cannot access admin page

```tsx
// Make sure you're using the correct role
<ProtectedRoute allowedRoles={['superadmin']}>
  {/* Only superadmin can access */}
</ProtectedRoute>

<ProtectedRoute allowedRoles={['admin', 'superadmin']}>
  {/* Both admin and superadmin can access */}
</ProtectedRoute>
```

## 📝 TypeScript Types

```tsx
import { UserRole, UserProfile } from "@/lib/supabase/types";

// Role type
type UserRole = "superadmin" | "admin" | "student";

// Profile type
interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}
```

## 🚀 Quick Setup

1. **Apply migration**: Run `lib/supabase/migrations/001_create_profiles_table.sql` in Supabase SQL Editor
2. **Sign up first user**: This user becomes SuperAdmin
3. **Test**: Go to `/admin/users` to manage roles

## 📚 Documentation Files

- `GETTING_STARTED.md` - Step-by-step setup guide
- `IMPLEMENTATION_SUMMARY.md` - Overview of implementation
- `ARCHITECTURE.md` - System architecture
- `lib/supabase/README_ROLES.md` - Detailed API docs
- `SETUP_ROLES.md` - Quick setup instructions

## 🆘 Need Help?

1. Check browser console for errors
2. Verify migration was applied
3. Check Supabase logs
4. Review RLS policies
5. Try signing out and back in

---

**Quick Links:**

- [Getting Started](./GETTING_STARTED.md)
- [Full Documentation](./lib/supabase/README_ROLES.md)
- [Architecture](./ARCHITECTURE.md)
