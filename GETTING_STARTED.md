# 🚀 Role-Based Authentication - Getting Started Checklist

## ✅ Pre-Implementation Checklist

- [x] Supabase project created
- [x] Environment variables configured
- [x] Google OAuth configured
- [x] TypeScript types created
- [x] Helper functions created
- [x] Auth context updated
- [x] Protected routes enhanced
- [x] Example components created

## 📋 Implementation Steps

### Step 1: Apply Database Migration ⚠️ REQUIRED

**This is the most important step!**

1. Open Supabase Dashboard: https://pgoparuhprpsjyqjdpte.supabase.co
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open the file: `lib/supabase/migrations/001_create_profiles_table.sql`
5. Copy ALL the SQL content
6. Paste into Supabase SQL Editor
7. Click **Run** (or press Ctrl+Enter)
8. Wait for "Success. No rows returned" message

**Expected Result:**

- ✓ profiles table created
- ✓ user_role enum created
- ✓ RLS policies created
- ✓ Triggers created

### Step 2: Verify Migration

1. Go to **Table Editor** in Supabase Dashboard
2. Look for `profiles` table
3. Check columns: id, email, full_name, avatar_url, role, created_at, updated_at

**OR** run verification queries:

1. Go to **SQL Editor**
2. Open: `lib/supabase/migrations/verify_setup.sql`
3. Run each query to verify setup

### Step 3: Clear Existing Users (Optional)

**Only do this if you want to test the "first user = superadmin" feature**

1. Go to **Authentication** → **Users**
2. Delete all existing users
3. Go to **Table Editor** → **profiles**
4. Delete all rows

### Step 4: Test First User (SuperAdmin)

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Open browser: http://localhost:3000/login

3. Sign in with Google (use your primary account)

4. Verify in Supabase:
   - Go to **Table Editor** → **profiles**
   - Check that first user has `role = 'superadmin'`

**Expected Result:**

- ✓ User created in auth.users
- ✓ Profile created in profiles table
- ✓ Role is 'superadmin'
- ✓ Redirected to /dashboard

### Step 5: Test Second User (Student)

1. Sign out from your app

2. Sign in with a different Google account

3. Verify in Supabase:
   - Go to **Table Editor** → **profiles**
   - Check that second user has `role = 'student'`

**Expected Result:**

- ✓ User created in auth.users
- ✓ Profile created in profiles table
- ✓ Role is 'student'
- ✓ Redirected to /dashboard

### Step 6: Test User Management (SuperAdmin)

1. Sign in as the first user (SuperAdmin)

2. Navigate to: http://localhost:3000/admin/users

3. You should see:

   - ✓ List of all users
   - ✓ User statistics
   - ✓ Role change dropdowns

4. Try changing a student to admin:
   - Select "Admin" from dropdown
   - Check Supabase to verify role changed

**Expected Result:**

- ✓ Can view all users
- ✓ Can change user roles
- ✓ Cannot change own role
- ✓ Changes persist in database

### Step 7: Test Role-Based UI

1. Sign in as SuperAdmin
2. Go to /dashboard
3. You should see:

   - ✓ "Super Admin" badge
   - ✓ "Manage Users" button
   - ✓ Super Admin Controls card

4. Sign in as Student
5. Go to /dashboard
6. You should see:
   - ✓ "Student" badge
   - ✓ Student Dashboard card
   - ✓ NO admin controls

### Step 8: Test Protected Routes

1. Sign in as Student

2. Try to access: http://localhost:3000/admin/users

3. Expected Result:

   - ✓ Redirected to /dashboard
   - ✓ Cannot access admin page

4. Sign in as SuperAdmin

5. Access: http://localhost:3000/admin/users

6. Expected Result:
   - ✓ Can access admin page
   - ✓ See user management interface

## 🧪 Testing Checklist

### Database Tests

- [ ] profiles table exists
- [ ] user_role enum exists
- [ ] RLS policies are enabled
- [ ] Triggers are working
- [ ] First user is superadmin
- [ ] Subsequent users are students

### Authentication Tests

- [ ] Can sign in with Google
- [ ] Profile is created automatically
- [ ] Profile loads in auth context
- [ ] Role is displayed correctly
- [ ] Can sign out

### Role Management Tests

- [ ] SuperAdmin can view all users
- [ ] SuperAdmin can change user roles
- [ ] Users cannot change own role
- [ ] Role changes persist
- [ ] Students cannot access admin pages

### UI Tests

- [ ] Role badge displays correctly
- [ ] Role-based content shows/hides
- [ ] Protected routes work
- [ ] User management table works
- [ ] Quick actions appear for admins

## 🐛 Troubleshooting

### Migration Failed

**Error:** "relation 'profiles' already exists"
**Solution:**

```sql
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
-- Then run migration again
```

### Profile Not Loading

**Symptoms:** Dashboard shows loading forever
**Solutions:**

1. Check browser console for errors
2. Verify migration was applied
3. Check Supabase logs
4. Try signing out and back in
5. Clear browser cache

### First User Not SuperAdmin

**Symptoms:** First user has role 'student'
**Solutions:**

1. Delete all users from auth.users
2. Delete all rows from profiles
3. Sign up again
4. Check trigger is working:
   ```sql
   SELECT * FROM information_schema.triggers
   WHERE event_object_table = 'users';
   ```

### Cannot Change Roles

**Symptoms:** Role dropdown doesn't work
**Solutions:**

1. Verify you're logged in as SuperAdmin
2. Check browser console for errors
3. Verify RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```
4. Check Supabase logs for permission errors

### Protected Routes Not Working

**Symptoms:** Can access admin pages as student
**Solutions:**

1. Check ProtectedRoute component is used
2. Verify allowedRoles prop is set
3. Check profile is loading
4. Clear browser cache

## 📊 Verification Queries

Run these in Supabase SQL Editor to verify everything:

```sql
-- 1. Check all users and roles
SELECT email, role, created_at
FROM profiles
ORDER BY created_at;

-- 2. Count by role
SELECT role, COUNT(*)
FROM profiles
GROUP BY role;

-- 3. Verify first user is superadmin
SELECT email, role
FROM profiles
ORDER BY created_at
LIMIT 1;

-- 4. Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';
```

## 🎯 Success Criteria

You've successfully implemented the role system when:

- ✅ Database migration applied without errors
- ✅ First user automatically becomes SuperAdmin
- ✅ New users automatically become Students
- ✅ SuperAdmin can access /admin/users
- ✅ SuperAdmin can change user roles
- ✅ Students cannot access admin pages
- ✅ Role badges display correctly
- ✅ Role-based content shows/hides properly
- ✅ Protected routes work as expected

## 📚 Next Steps

After successful implementation:

1. **Customize Role Permissions**

   - Add more granular permissions
   - Create custom role-based features

2. **Enhance Admin Panel**

   - Add user search/filter
   - Add bulk operations
   - Add user activity logs

3. **Add Notifications**

   - Email notifications for role changes
   - In-app notifications

4. **Improve Security**

   - Add audit logs
   - Add role change confirmations
   - Add rate limiting

5. **Documentation**
   - Document your custom roles
   - Create user guides
   - Add API documentation

## 🆘 Need Help?

If you encounter issues:

1. Check the documentation:

   - `IMPLEMENTATION_SUMMARY.md`
   - `lib/supabase/README_ROLES.md`
   - `SETUP_ROLES.md`

2. Review the code:

   - `contexts/auth.tsx` - Auth context
   - `lib/supabase/profiles.ts` - Helper functions
   - `components/shared/protected-route.tsx` - Route protection

3. Check Supabase:
   - SQL Editor for queries
   - Table Editor for data
   - Logs for errors

---

**Ready to start?** Begin with Step 1: Apply Database Migration! 🚀
