import { supabase } from "./client";
import { UserProfile, UserRole } from "./types";

/**
 * Get the current user's profile including role
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getCurrentUserProfile:", error);
    return null;
  }
}

/**
 * Get a user profile by ID
 */
export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, "id" | "created_at" | "updated_at">>
): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    return null;
  }
}

/**
 * Update user role (superadmin only)
 */
export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user role:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in updateUserRole:", error);
    return null;
  }
}

/**
 * Get all users (admin and superadmin only)
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching all users:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return [];
  }
}

/**
 * Get users by role
 */
export async function getUsersByRole(role: UserRole): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", role)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users by role:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getUsersByRole:", error);
    return [];
  }
}

/**
 * Check if user has a specific role
 */
export function hasRole(
  userRole: UserRole | undefined,
  allowedRoles: UserRole[]
): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

/**
 * Check if user is superadmin
 */
export function isSuperAdmin(userRole: UserRole | undefined): boolean {
  return userRole === "superadmin";
}

/**
 * Check if user is admin or superadmin
 */
export function isAdmin(userRole: UserRole | undefined): boolean {
  return userRole === "admin" || userRole === "superadmin";
}

/**
 * Check if user is student
 */
export function isStudent(userRole: UserRole | undefined): boolean {
  return userRole === "student";
}
