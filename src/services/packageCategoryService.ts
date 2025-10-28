import { api } from '@/lib/api'

export interface PackageCategory {
  categoryId: number
  categoryName: string
  description?: string
  isActive: boolean
  [key: string]: any
}

export interface CreatePackageCategoryRequest {
  categoryName: string
  description?: string
}

class PackageCategoryService {
  // GET /api/PackageCategory
  async getAllCategories(): Promise<PackageCategory[]> {
    const { data } = await api.get('/api/PackageCategory')
    return data
  }

  // POST /api/PackageCategory
  async createCategory(request: CreatePackageCategoryRequest): Promise<PackageCategory> {
    const { data } = await api.post('/api/PackageCategory', request)
    return data
  }

  // GET /api/PackageCategory/{id}
  async getCategoryById(id: number): Promise<PackageCategory> {
    const { data } = await api.get(`/api/PackageCategory/${id}`)
    return data
  }

  // PUT /api/PackageCategory/{id}
  async updateCategory(id: number, request: Partial<CreatePackageCategoryRequest>): Promise<PackageCategory> {
    const { data } = await api.put(`/api/PackageCategory/${id}`, request)
    return data
  }

  // DELETE /api/PackageCategory/{id}
  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/api/PackageCategory/${id}`)
  }

  // GET /api/PackageCategory/{id}/package-count
  async getPackageCountByCategory(id: number): Promise<number> {
    const { data } = await api.get(`/api/PackageCategory/${id}/package-count`)
    return data
  }

  // GET /api/PackageCategory/active
  async getActiveCategories(): Promise<PackageCategory[]> {
    const { data } = await api.get('/api/PackageCategory/active')
    return data
  }
}

export const packageCategoryService = new PackageCategoryService()

