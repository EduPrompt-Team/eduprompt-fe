import { api } from '@/lib/api'

export type Grade = '10' | '11' | '12'

export interface StorageTemplate {
  storageId: number
  userId: number
  packageId: number
  templateName: string
  templateContent?: string
  grade?: Grade
  subject?: string
  chapter?: string
  isPublic: boolean
  createdAt: string
}

export interface CreateStorageTemplateRequest {
  packageId: number
  templateName: string
  templateContent?: string
  grade?: Grade
  subject?: string
  chapter?: string
  isPublic?: boolean
}

export interface UpdateStorageTemplateRequest {
  templateName?: string
  templateContent?: string
  grade?: Grade
  subject?: string
  chapter?: string
  isPublic?: boolean
}

class StorageTemplateService {
  // POST /api/storage-templates
  async saveTemplate(request: CreateStorageTemplateRequest): Promise<StorageTemplate> {
    const { data } = await api.post('/api/storage-templates', request)
    return data
  }

  // PATCH /api/storage-templates/{id}
  async updateTemplate(id: number, request: UpdateStorageTemplateRequest): Promise<StorageTemplate> {
    const { data } = await api.patch(`/api/storage-templates/${id}`, request)
    return data
  }

  // DELETE /api/storage-templates/{id}
  async deleteTemplate(id: number): Promise<void> {
    await api.delete(`/api/storage-templates/${id}`)
  }

  // GET /api/storage-templates/check/{PackageId}
  async checkTemplateSaved(packageId: number): Promise<boolean> {
    const { data } = await api.get(`/api/storage-templates/check/${packageId}`)
    return data
  }

  // GET /api/storage-templates/my-storage
  async getMyStorage(): Promise<StorageTemplate[]> {
    const { data } = await api.get('/api/storage-templates/my-storage')
    return data
  }

  // GET /api/storage-templates/public
  async getPublicTemplates(q: { packageId?: number; grade?: Grade; subject?: string; chapter?: string }): Promise<StorageTemplate[]> {
    const { data } = await api.get('/api/storage-templates/public', { params: q })
    return data
  }

  // POST /api/storage-templates/{id}/publish
  async publishTemplate(id: number): Promise<void> {
    await api.post(`/api/storage-templates/${id}/publish`, {})
  }

  // POST /api/storage-templates/{id}/unpublish
  async unpublishTemplate(id: number): Promise<void> {
    await api.post(`/api/storage-templates/${id}/unpublish`, {})
  }
}

export const storageTemplateService = new StorageTemplateService()

