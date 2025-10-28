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
  // GET /api/Categories
  async getAllCategories(): Promise<Category[]> {
    const { data } = await api.get('/api/Categories')
    return data
  }

  // POST /api/Categories
  async createCategory(request: CreateCategoryRequest): Promise<Category> {
    const { data } = await api.post('/api/Categories', request)
    return data
  }

  // GET /api/Categories/{id}
  async getCategoryById(id: number): Promise<Category> {
    const { data } = await api.get(`/api/Categories/${id}`)
    return data
  }

  // PUT /api/Categories/{id}
  async updateCategory(id: number, request: UpdateCategoryRequest): Promise<Category> {
    const { data } = await api.put(`/api/Categories/${id}`, request)
    return data
  }

  // DELETE /api/Categories/{id}
  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/api/Categories/${id}`)
  }

  // GET /api/Categories/{id}/subcategories
  async getSubcategories(categoryId: number): Promise<Category[]> {
    const { data } = await api.get(`/api/Categories/${categoryId}/subcategories`)
    return data
  }

  // GET /api/Categories/root
  async getRootCategories(): Promise<Category[]> {
    const { data } = await api.get('/api/Categories/root')
    return data
  }
}

export const categoryService = new CategoryService()

