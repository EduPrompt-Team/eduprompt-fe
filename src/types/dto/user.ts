import { UserStatus } from '@/types/status'

export interface UserDto {
  userId: number
  roleId?: number | null
  fullName: string
  email: string
  phone?: string | null
  profileUrl?: string | null
  createdDate?: string | null
  updatedDate?: string | null
  status?: UserStatus | null
  roleName?: string | null // Role name from Roles table
}


