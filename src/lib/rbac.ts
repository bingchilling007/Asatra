// Role-Based Access Control (RBAC) utilities

import { UserRole } from '@prisma/client';

// Role hierarchy (higher = more permissions)
const ROLE_HIERARCHY: Record<UserRole, number> = {
  GUEST: 1,
  HOST: 2,
  ADMIN: 3,
};

/**
 * Check if a user has at least the required role level
 */
export function hasRole(userRole: UserRole | string | undefined, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  const userLevel = ROLE_HIERARCHY[userRole as UserRole] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  return userLevel >= requiredLevel;
}

/**
 * Check if user can access host features
 */
export function canAccessHost(role: UserRole | string | undefined): boolean {
  return hasRole(role, 'HOST');
}

/**
 * Check if user can access admin features
 */
export function canAccessAdmin(role: UserRole | string | undefined): boolean {
  return hasRole(role, 'ADMIN');
}

/**
 * Check if user is exactly the specified role
 */
export function isRole(userRole: UserRole | string | undefined, targetRole: UserRole): boolean {
  return userRole === targetRole;
}

/**
 * Throws an error if user doesn't have required role
 * Use in API routes and server actions
 */
export function requireRole(
  userRole: UserRole | string | undefined,
  requiredRole: UserRole,
  message = 'Insufficient permissions'
): void {
  if (!hasRole(userRole, requiredRole)) {
    throw new Error(message);
  }
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole | string): string {
  const displayNames: Record<UserRole, string> = {
    GUEST: 'Guest',
    HOST: 'Host',
    ADMIN: 'Administrator',
  };
  return displayNames[role as UserRole] ?? role;
}
