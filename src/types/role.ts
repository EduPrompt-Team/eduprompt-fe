// Role constants based on common database patterns
export const UserRole = {
  Admin: 'Admin',
  User: 'User',
  Moderator: 'Moderator',
} as const

export type UserRoleType = typeof UserRole[keyof typeof UserRole]

// Helper function to check if user is admin
export function isAdmin(roleName?: string | null): boolean {
  return roleName === UserRole.Admin
}

// Helper function to check if user has specific role
export function hasRole(roleName: string, targetRole: string): boolean {
  return roleName === targetRole
}

// Helper function to get role name from userId (requires API call)
export async function getUserRole(userId: number): Promise<string | null> {
  try {
    const user = await fetch(`/api/Users/${userId}`).then(r => r.json())
    if (user?.roleId) {
      const role = await fetch(`/api/Roles/${user.roleId}`).then(r => r.json())
      return role?.roleName || null
    }
    return null
  } catch {
    return null
  }
}

