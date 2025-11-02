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
  // GET /api/package-categories
  async getAllCategories(): Promise<PackageCategory[]> {
    const { data } = await api.get('/api/package-categories')
    return data
  }

  // POST /api/package-categories
  async createCategory(request: CreatePackageCategoryRequest): Promise<PackageCategory> {
    const { data } = await api.post('/api/package-categories', request)
    return data
  }

  // GET /api/package-categories/{id}
  async getCategoryById(id: number): Promise<PackageCategory> {
    const { data } = await api.get(`/api/package-categories/${id}`)
    return data
  }

  // PUT /api/package-categories/{id}
  async updateCategory(id: number, request: Partial<CreatePackageCategoryRequest>): Promise<PackageCategory> {
    const { data } = await api.put(`/api/package-categories/${id}`, request)
    return data
  }

  // DELETE /api/package-categories/{id}
  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/api/package-categories/${id}`)
  }

  // GET /api/package-categories/{id}/package-count
  async getPackageCountByCategory(id: number): Promise<number> {
    const { data } = await api.get(`/api/package-categories/${id}/package-count`)
    return data
  }

  // GET /api/package-categories/active
  async getActiveCategories(): Promise<PackageCategory[]> {
    const { data } = await api.get('/api/package-categories/active')
    return data
  }
}

export const packageCategoryService = new PackageCategoryService()

