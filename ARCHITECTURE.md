# Role-Based Authentication Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ProofBench Application                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌────────────────────┐          ┌────────────────────┐
        │   Frontend (Next.js)│          │  Supabase Backend  │
        └────────────────────┘          └────────────────────┘
                    │                               │
                    │                               │
        ┌───────────┴───────────┐       ┌──────────┴──────────┐
        │                       │       │                     │
        ▼                       ▼       ▼                     ▼
┌──────────────┐      ┌──────────────┐ ┌──────────┐  ┌──────────────┐
│ Auth Context │      │  Components  │ │Auth.users│  │   Profiles   │
│              │      │              │ │          │  │    Table     │
│ - user       │      │ - Protected  │ │ - id     │  │              │
│ - profile    │      │   Route      │ │ - email  │  │ - id (PK)    │
│ - loading    │      │ - Role Badge │ │ - meta   │  │ - email      │
│ - methods    │      │ - User Mgmt  │ └──────────┘  │ - role       │
└──────────────┘      └──────────────┘       │       │ - full_name  │
                                             │       │ - avatar_url │
                                             │       │ - timestamps │
                                             │       └──────────────┘
                                             │              │
                                             │              │
                                        ┌────┴──────────────┴────┐
                                        │   Database Trigger     │
                                        │  handle_new_user()     │
                                        │                        │
                                        │ 1. Count users         │
                                        │ 2. If first → superadmin│
                                        │ 3. Else → student      │
                                        │ 4. Create profile      │
                                        └────────────────────────┘
```

## Data Flow

### 1. User Sign-Up Flow

```
User clicks "Sign in with Google"
            │
            ▼
Google OAuth Authentication
            │
            ▼
Supabase Auth creates user in auth.users
            │
            ▼
Trigger: on_auth_user_created fires
            │
            ▼
Function: handle_new_user() executes
            │
            ├─── Count existing profiles
            │
            ├─── If count = 0 → role = 'superadmin'
            │    Else → role = 'student'
            │
            ▼
Profile created in profiles table
            │
            ▼
User redirected to /dashboard
            │
            ▼
Auth context fetches profile
            │
            ▼
Dashboard shows role-based content
```

### 2. Profile Loading Flow

```
User signs in
      │
      ▼
Auth context initialized
      │
      ├─── getSession() → user data
      │
      ├─── getCurrentUserProfile() → profile data
      │
      ▼
Profile state updated
      │
      ├─── profile.role available
      │
      ├─── Helper methods available:
      │    - isSuperAdmin()
      │    - isAdmin()
      │    - isStudent()
      │
      ▼
Components render based on role
```

### 3. Role Change Flow (SuperAdmin only)

```
SuperAdmin selects new role
            │
            ▼
updateUserRole(userId, newRole) called
            │
            ▼
Supabase RLS checks permissions
            │
            ├─── Is caller SuperAdmin? ✓
            │
            ├─── Is target user different? ✓
            │
            ▼
Update profiles SET role = newRole
            │
            ▼
Trigger: on_profile_updated fires
            │
            ▼
updated_at timestamp updated
            │
            ▼
Success response
            │
            ▼
UI updates to show new role
```

## Component Hierarchy

```
App
│
├── AuthProvider (contexts/auth.tsx)
│   │
│   ├── Manages user state
│   ├── Manages profile state
│   ├── Provides role checking methods
│   └── Handles auth operations
│
├── Pages
│   │
│   ├── /login
│   │   └── Public page
│   │
│   ├── /dashboard
│   │   └── ProtectedRoute
│   │       ├── Requires: authenticated
│   │       └── Shows role-based content
│   │
│   └── /admin/users
│       └── ProtectedRoute
│           ├── Requires: ['superadmin']
│           └── UserManagement component
│
└── Components
    │
    ├── ProtectedRoute
    │   ├── Checks authentication
    │   ├── Checks role permissions
    │   └── Redirects if unauthorized
    │
    ├── UserRoleBadge
    │   └── Displays user's role
    │
    ├── RoleBasedContent
    │   └── Shows content based on role
    │
    └── UserManagement
        ├── Lists all users
        ├── Shows role statistics
        └── Allows role changes
```

## Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                        auth.users                            │
│  (Managed by Supabase Auth)                                 │
├─────────────────────────────────────────────────────────────┤
│  id                UUID (PK)                                 │
│  email             TEXT                                      │
│  encrypted_password TEXT                                     │
│  raw_user_meta_data JSONB                                    │
│  created_at        TIMESTAMPTZ                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Foreign Key
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     public.profiles                          │
│  (Custom table for role management)                         │
├─────────────────────────────────────────────────────────────┤
│  id                UUID (PK, FK → auth.users.id)            │
│  email             TEXT NOT NULL                             │
│  full_name         TEXT                                      │
│  avatar_url        TEXT                                      │
│  role              user_role NOT NULL DEFAULT 'student'      │
│  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()        │
│  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()        │
├─────────────────────────────────────────────────────────────┤
│  Indexes:                                                    │
│  - profiles_role_idx ON role                                │
│  - profiles_email_idx ON email                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       user_role ENUM                         │
├─────────────────────────────────────────────────────────────┤
│  - 'superadmin'                                             │
│  - 'admin'                                                  │
│  - 'student'                                                │
└─────────────────────────────────────────────────────────────┘
```

## Row Level Security (RLS) Policies

```
┌─────────────────────────────────────────────────────────────┐
│                    RLS Policies on profiles                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. "Users can view their own profile"                      │
│     SELECT: auth.uid() = id                                 │
│                                                              │
│  2. "Users can update their own profile"                    │
│     UPDATE: auth.uid() = id                                 │
│                                                              │
│  3. "Superadmins can view all profiles"                     │
│     SELECT: EXISTS (                                        │
│       SELECT 1 FROM profiles                                │
│       WHERE id = auth.uid() AND role = 'superadmin'         │
│     )                                                       │
│                                                              │
│  4. "Superadmins can update all profiles"                   │
│     UPDATE: EXISTS (                                        │
│       SELECT 1 FROM profiles                                │
│       WHERE id = auth.uid() AND role = 'superadmin'         │
│     )                                                       │
│                                                              │
│  5. "Admins can view all profiles"                          │
│     SELECT: EXISTS (                                        │
│       SELECT 1 FROM profiles                                │
│       WHERE id = auth.uid() AND role = 'admin'              │
│     )                                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Role Hierarchy & Permissions

```
┌─────────────────────────────────────────────────────────────┐
│                        SUPERADMIN                            │
│  (First user to sign up)                                    │
├─────────────────────────────────────────────────────────────┤
│  ✓ View all users                                           │
│  ✓ Edit all users                                           │
│  ✓ Change any user's role                                   │
│  ✓ Access /admin/users                                      │
│  ✓ All admin permissions                                    │
│  ✓ All student permissions                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Can promote to
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                          ADMIN                               │
│  (Promoted by SuperAdmin)                                   │
├─────────────────────────────────────────────────────────────┤
│  ✓ View all users                                           │
│  ✓ Manage students                                          │
│  ✓ View reports                                             │
│  ✗ Cannot change roles                                      │
│  ✗ Cannot access /admin/users                               │
│  ✓ All student permissions                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Default role
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         STUDENT                              │
│  (Default for all new users)                                │
├─────────────────────────────────────────────────────────────┤
│  ✓ View own profile                                         │
│  ✓ Edit own profile (except role)                          │
│  ✓ Access student dashboard                                │
│  ✗ Cannot view other users                                  │
│  ✗ Cannot access admin pages                                │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
ProofBench/
│
├── lib/
│   └── supabase/
│       ├── client.ts                    # Supabase client setup
│       ├── types.ts                     # TypeScript types
│       ├── profiles.ts                  # Profile helper functions
│       ├── README_ROLES.md              # Full documentation
│       └── migrations/
│           ├── 001_create_profiles_table.sql  # Main migration
│           └── verify_setup.sql         # Verification queries
│
├── contexts/
│   └── auth.tsx                         # Auth context with roles
│
├── components/
│   ├── shared/
│   │   ├── protected-route.tsx          # Role-based route protection
│   │   └── role-based-components.tsx    # Role UI components
│   │
│   └── admin/
│       └── user-management.tsx          # User management interface
│
├── app/
│   ├── login/
│   │   └── page.tsx                     # Login page
│   │
│   ├── dashboard/
│   │   └── page.tsx                     # Dashboard with role content
│   │
│   └── admin/
│       └── users/
│           └── page.tsx                 # User management page
│
├── IMPLEMENTATION_SUMMARY.md            # Implementation overview
├── SETUP_ROLES.md                       # Quick setup guide
├── GETTING_STARTED.md                   # Step-by-step checklist
└── ARCHITECTURE.md                      # This file
```

## Security Considerations

### 1. Row Level Security (RLS)

- ✅ Enabled on profiles table
- ✅ Users can only modify their own profile
- ✅ Role changes restricted to SuperAdmin
- ✅ Prevents unauthorized access

### 2. Role Immutability

- ✅ Users cannot change their own role
- ✅ Prevents privilege escalation
- ✅ Only SuperAdmin can modify roles

### 3. First User Protection

- ✅ Automatically becomes SuperAdmin
- ✅ No manual intervention needed
- ✅ Atomic operation via trigger

### 4. Type Safety

- ✅ TypeScript types for all roles
- ✅ Compile-time role checking
- ✅ Autocomplete support

### 5. Client-Side Protection

- ✅ Protected routes
- ✅ Role-based rendering
- ✅ Auth context validation

### 6. Server-Side Protection

- ✅ RLS policies
- ✅ Database triggers
- ✅ Function security

## Performance Considerations

### 1. Indexes

- ✅ Index on role column
- ✅ Index on email column
- ✅ Fast role-based queries

### 2. Caching

- ✅ Profile cached in auth context
- ✅ Reduced database queries
- ✅ Refresh on demand

### 3. Optimistic Updates

- ✅ UI updates immediately
- ✅ Rollback on error
- ✅ Better UX

## Scalability

### Current Implementation

- Supports unlimited users
- Three fixed roles
- Simple permission model

### Future Enhancements

- Custom permissions per role
- Dynamic role creation
- Permission groups
- Role hierarchies
- Audit logging
- Bulk operations

---

This architecture provides a solid foundation for role-based authentication while maintaining security, performance, and scalability.
