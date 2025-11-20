# Quick Setup Guide for Role-Based Authentication

## Step 1: Apply Database Migration

You need to run the SQL migration in your Supabase project. Here are the steps:

### Using Supabase Dashboard (Easiest)

1. Open your Supabase project: https://pgoparuhprpsjyqjdpte.supabase.co
2. Go to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `lib/supabase/migrations/001_create_profiles_table.sql`
5. Paste it into the SQL editor
6. Click **Run** or press `Ctrl+Enter`
7. You should see "Success. No rows returned" message

### Verify the Migration

After running the migration, verify it worked:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see a new table called `profiles`
3. Check that it has the following columns:
   - id (uuid)
   - email (text)
   - full_name (text)
   - avatar_url (text)
   - role (user_role enum)
   - created_at (timestamptz)
   - updated_at (timestamptz)

## Step 2: Test the System

### Clear Existing Users (Optional, for testing)

If you want to test the "first user becomes superadmin" feature:

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Delete all existing users
3. Go to **Table Editor** → **profiles**
4. Delete all rows

### Sign Up First User

1. Run your application: `npm run dev`
2. Go to `/login`
3. Sign in with Google
4. This user will automatically become **SuperAdmin**

### Verify First User is SuperAdmin

1. Go to Supabase Dashboard → **Table Editor** → **profiles**
2. You should see one row with `role = 'superadmin'`

### Sign Up Additional Users

1. Sign out from your app
2. Sign in with a different Google account
3. This user will automatically become **Student**

## Step 3: Use the Role System

### View User Profile and Role

Add this to any page:

```tsx
import { useAuth } from "@/contexts/auth";

export default function MyPage() {
  const { profile, isSuperAdmin, isAdmin, isStudent } = useAuth();

  return (
    <div>
      <p>Email: {profile?.email}</p>
      <p>Role: {profile?.role}</p>
      <p>Is SuperAdmin: {isSuperAdmin() ? "Yes" : "No"}</p>
    </div>
  );
}
```

### Protect Routes by Role

```tsx
import { ProtectedRoute } from "@/components/shared/protected-route";

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      <h1>Admin Only Content</h1>
    </ProtectedRoute>
  );
}
```

### Use the User Management Component

Create a new page at `app/admin/users/page.tsx`:

```tsx
import { UserManagement } from "@/components/admin/user-management";
import { ProtectedRoute } from "@/components/shared/protected-route";

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={["superadmin"]}>
      <div className="container mx-auto py-8">
        <UserManagement />
      </div>
    </ProtectedRoute>
  );
}
```

## Troubleshooting

### Migration Failed

If you get an error running the migration:

1. Check if the `profiles` table already exists
2. If it does, you may need to drop it first:
   ```sql
   DROP TABLE IF EXISTS public.profiles CASCADE;
   DROP TYPE IF EXISTS user_role CASCADE;
   ```
3. Then run the migration again

### Profile Not Loading

1. Check browser console for errors
2. Verify the migration was applied
3. Check that RLS policies are enabled
4. Try signing out and signing in again

### Role Not Updating

1. Make sure you're logged in as SuperAdmin
2. Check the browser console for errors
3. Verify RLS policies allow SuperAdmin to update roles

## Next Steps

1. ✅ Apply the database migration
2. ✅ Test with first user (becomes SuperAdmin)
3. ✅ Test with second user (becomes Student)
4. ✅ Test role-based UI components
5. ✅ Create admin pages for user management
6. Consider adding:
   - Email notifications for role changes
   - Audit log for role changes
   - Bulk user operations
   - Custom permissions beyond roles
