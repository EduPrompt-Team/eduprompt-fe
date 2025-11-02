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
  status?: string | null
  password?: string | null
  googleId?: string | null
  refreshToken?: string | null
  refreshTokenExpiryTime?: string | null
}


