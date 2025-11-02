import { api } from '@/lib/api'

export interface TemplateArchitectureDto {
  architectureId: number
  storageId: number
  architectureName: string
  architectureType: string
  configurationJson?: string | null
}

class TemplateArchitectureService {
  // POST /api/template-architectures
  async create(payload: Omit<TemplateArchitectureDto, 'architectureId'>): Promise<TemplateArchitectureDto> {
    const { data } = await api.post('/api/template-architectures', payload)
    return data
  }

  // PUT /api/template-architectures/{architectureId}
  async update(architectureId: number, payload: Partial<TemplateArchitectureDto>): Promise<TemplateArchitectureDto> {
    const { data } = await api.put(`/api/template-architectures/${architectureId}`, payload)
    return data
  }

  // DELETE /api/template-architectures/{architectureId}
  async remove(architectureId: number): Promise<void> {
    await api.delete(`/api/template-architectures/${architectureId}`)
  }

  // GET /api/template-architectures/instance/{InstanceId}
  async getByInstance(instanceId: number): Promise<TemplateArchitectureDto> {
    const { data } = await api.get(`/api/template-architectures/instance/${instanceId}`)
    return data
  }
}

export const templateArchitectureService = new TemplateArchitectureService()
