import { api } from '@/lib/api'

export interface Category {
  categoryId: number
  categoryName: string
  description?: string
  parentId?: number
  subcategories?: Category[]
  [key: string]: any
}

export interface CreateCategoryRequest {
  categoryName: string
  description?: string
  parentId?: number
}

export interface UpdateCategoryRequest {
  categoryName?: string
  description?: string
  parentId?: number
}

class CategoryService {
  // GET /api/categories
  async getAllCategories(): Promise<Category[]> {
    const { data } = await api.get('/api/categories')
    return data
  }

  // POST /api/categories
  async createCategory(request: CreateCategoryRequest): Promise<Category> {
    const { data } = await api.post('/api/categories', request)
    return data
  }

  // GET /api/categories/{id}
  async getCategoryById(id: number): Promise<Category> {
    const { data } = await api.get(`/api/categories/${id}`)
    return data
  }

  // PUT /api/categories/{id}
  async updateCategory(id: number, request: UpdateCategoryRequest): Promise<Category> {
    const { data } = await api.put(`/api/categories/${id}`, request)
    return data
  }

  // DELETE /api/categories/{id}
  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/api/categories/${id}`)
  }

  // GET /api/categories/{id}/subcategories
  async getSubcategories(categoryId: number): Promise<Category[]> {
    const { data } = await api.get(`/api/categories/${categoryId}/subcategories`)
    return data
  }

  // GET /api/categories/root
  async getRootCategories(): Promise<Category[]> {
    const { data } = await api.get('/api/categories/root')
    return data
  }
}

export const categoryService = new CategoryService()

