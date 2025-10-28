import { api } from '@/lib/api'

export interface Role {
  roleId: number
  roleName: string
  description?: string
  [key: string]: any
}

export interface CreateRoleRequest {
  roleName: string
  description?: string
}

export interface UpdateRoleRequest {
  roleName?: string
  description?: string
}

class RoleService {
  // GET /api/Roles
  async getAllRoles(): Promise<Role[]> {
    const { data } = await api.get('/api/Roles')
    return data
  }

  // POST /api/Roles
  async createRole(request: CreateRoleRequest): Promise<Role> {
    const { data } = await api.post('/api/Roles', request)
    return data
  }

  // GET /api/Roles/{id}
  async getRoleById(id: number): Promise<Role> {
    const { data } = await api.get(`/api/Roles/${id}`)
    return data
  }

  // PUT /api/Roles/{id}
  async updateRole(id: number, request: UpdateRoleRequest): Promise<Role> {
    const { data } = await api.put(`/api/Roles/${id}`, request)
    return data
  }

  // DELETE /api/Roles/{id}
  async deleteRole(id: number): Promise<void> {
    await api.delete(`/api/Roles/${id}`)
  }
}

export const roleService = new RoleService()

