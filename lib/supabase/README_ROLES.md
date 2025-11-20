# Role-Based Authentication System

This project implements a comprehensive role-based authentication system using Supabase with three distinct roles:

- **SuperAdmin**: The first user to sign up. Has full access to all features and can manage other users' roles.
- **Admin**: Can view all users and manage students (can be promoted by SuperAdmin).
- **Student**: Default role for all new users after the first one.

## Architecture

### Database Schema

The system uses a `profiles` table that extends Supabase Auth:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,              -- References auth.users(id)
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL,          -- 'superadmin' | 'admin' | 'student'
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Automatic Role Assignment

A database trigger automatically creates a profile when a new user signs up:

1. **First user** → Assigned `superadmin` role
2. **All subsequent users** → Assigned `student` role
3. **SuperAdmin can promote** → Users to `admin` role

### Row Level Security (RLS)

The following policies are in place:

- Users can view and update their own profile (except role)
- SuperAdmins can view and update all profiles
- Admins can view all profiles

## Setup Instructions

### 1. Apply Database Migration

You need to run the SQL migration in your Supabase project:

**Option A: Using Supabase Dashboard**

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `lib/supabase/migrations/001_create_profiles_table.sql`
4. Paste and run the SQL

**Option B: Using Supabase CLI** (Recommended)

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply the migration
supabase db push
```

### 2. Configure Environment Variables

Ensure your `.env.local` file has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Test the Implementation

1. **Clear existing users** (if testing):

   - Go to Supabase Dashboard → Authentication → Users
   - Delete all test users

2. **Sign up first user**:

   - This user will automatically become SuperAdmin

3. **Sign up additional users**:
   - These will be Students by default

## Usage

### In Components

```tsx
import { useAuth } from "@/contexts/auth";

function MyComponent() {
  const { user, profile, isSuperAdmin, isAdmin, isStudent } = useAuth();

  if (isSuperAdmin()) {
    return <SuperAdminPanel />;
  }

  if (isAdmin()) {
    return <AdminPanel />;
  }

  return <StudentDashboard />;
}
```

### Protected Routes

```tsx
import { ProtectedRoute } from "@/components/shared/protected-route";

// Protect entire page
export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <AdminContent />
    </ProtectedRoute>
  );
}
```

### Role-Based Rendering

```tsx
import { useAuth } from "@/contexts/auth";

function Dashboard() {
  const { profile, hasRole } = useAuth();

  return (
    <div>
      <h1>Welcome, {profile?.full_name}</h1>

      {hasRole(["superadmin"]) && <button>Manage All Users</button>}

      {hasRole(["admin", "superadmin"]) && <button>View Reports</button>}
    </div>
  );
}
```

## API Functions

### Profile Management

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

// Update user profile
await updateUserProfile(userId, {
  full_name: "John Doe",
  avatar_url: "https://...",
});

// Update user role (SuperAdmin only)
await updateUserRole(userId, "admin");

// Get all users (Admin/SuperAdmin only)
const users = await getAllUsers();

// Get users by role
const students = await getUsersByRole("student");
```

## Role Hierarchy

```
SuperAdmin
  ├─ Full system access
  ├─ Can promote users to Admin
  ├─ Can demote Admins to Student
  └─ Can view/edit all profiles

Admin
  ├─ Can view all users
  ├─ Can manage students
  └─ Cannot change roles

Student
  ├─ Can view own profile
  └─ Can update own profile (except role)
```

## Security Considerations

1. **Row Level Security**: All database operations are protected by RLS policies
2. **Role immutability**: Users cannot change their own role
3. **First user protection**: The first user is automatically SuperAdmin
4. **Type safety**: TypeScript types ensure role consistency

## Troubleshooting

### Profile not loading

- Check browser console for errors
- Verify the migration was applied successfully
- Ensure RLS policies are enabled

### Role not updating

- Only SuperAdmin can update roles
- Check that you're using `updateUserRole()` function
- Verify the user making the change is SuperAdmin

### First user not SuperAdmin

- Delete all users from Supabase Auth
- Delete all rows from profiles table
- Sign up again as the first user

## Next Steps

Consider implementing:

- Admin dashboard for user management
- Role change audit log
- Email notifications for role changes
- Bulk user operations
- Custom permissions beyond roles
