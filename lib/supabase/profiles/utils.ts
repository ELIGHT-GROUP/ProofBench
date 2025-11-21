import { UserRole } from "./types";

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
