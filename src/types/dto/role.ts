import { RoleStatus } from '@/types/status'

export interface RoleDto {
  roleId: number
  roleName: string
  status?: RoleStatus | null
}


