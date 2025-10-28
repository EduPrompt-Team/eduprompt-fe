import { api } from '@/lib/api'

export interface User {
  userId: number
  email: string
  fullName?: string
  roleId?: number
  [key: string]: any
}

export interface CreateUserRequest {
  email: string
  password: string
  fullName?: string
  roleId?: number
}

export interface UpdateUserRequest {
  email?: string
  fullName?: string
  roleId?: number
}

class UserService {
  // GET /api/Users
  async getAllUsers(): Promise<User[]> {
    const { data } = await api.get('/api/Users')
    return data
  }

  // POST /api/Users
  async createUser(request: CreateUserRequest): Promise<User> {
    const { data } = await api.post('/api/Users', request)
    return data
  }

  // GET /api/Users/{id}
  async getUserById(id: number): Promise<User> {
    const { data } = await api.get(`/api/Users/${id}`)
    return data
  }

  // PUT /api/Users/{id}
  async updateUser(id: number, request: UpdateUserRequest): Promise<User> {
    const { data } = await api.put(`/api/Users/${id}`, request)
    return data
  }

  // DELETE /api/Users/{id}
  async deleteUser(id: number): Promise<void> {
    await api.delete(`/api/Users/${id}`)
  }
}

export const userService = new UserService()

