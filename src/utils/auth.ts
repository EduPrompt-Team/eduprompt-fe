import type { UserDto } from '@/types/dto/user'
import { UserRole, isAdmin } from '@/types/role'

/**
 * Check if current user is admin
 * @param user - User object from API (should include roleName)
 * @returns boolean
 */
export function checkIsAdmin(user: UserDto | null | undefined): boolean {
  if (!user) return false
  // Admin if roleId === 1 or roleName === 'Admin'
  if (user.roleId === 1) return true
  return isAdmin(user.roleName)
}

/**
 * Check if user has specific role
 * @param user - User object from API
 * @param role - Role name to check
 * @returns boolean
 */
export function hasRole(user: UserDto | null | undefined, role: string): boolean {
  if (!user) return false
  return user.roleName === role
}

/**
 * Get user role name
 * @param user - User object from API
 * @returns Role name or 'User' as default
 */
export function getUserRole(user: UserDto | null | undefined): string {
  return user?.roleName || UserRole.User
}

