// User role types
export type UserRole = "superadmin" | "admin" | "student";

// Profile interface matching the database schema
export interface UserProfile {
  id: string; // matches auth.users.id
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

// Extended user type with profile
export interface UserWithProfile {
  id: string;
  email: string;
  profile: UserProfile | null;
}
