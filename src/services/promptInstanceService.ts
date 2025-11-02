import { api } from '@/lib/api'
import type { PromptInstanceDto, PromptInstanceDetailDto } from '@/types/dto/prompt'

class PromptInstanceService {
  // POST /api/prompt-instances
  async create(payload: Omit<PromptInstanceDto, 'instanceId' | 'executedAt'>): Promise<PromptInstanceDto> {
    const { data } = await api.post('/api/prompt-instances', payload)
    return data
  }

  // GET /api/prompt-instances/{InstanceId}
  async getById(instanceId: number): Promise<PromptInstanceDto> {
    const { data } = await api.get(`/api/prompt-instances/${instanceId}`)
    return data
  }

  // PUT /api/prompt-instances/{InstanceId}
  async update(instanceId: number, payload: Partial<PromptInstanceDto>): Promise<PromptInstanceDto> {
    const { data } = await api.put(`/api/prompt-instances/${instanceId}`, payload)
    return data
  }

  // DELETE /api/prompt-instances/{InstanceId}
  async remove(instanceId: number): Promise<void> {
    await api.delete(`/api/prompt-instances/${instanceId}`)
  }

  // POST /api/prompt-instances/{InstanceId}/complete
  async complete(instanceId: number, outputData: Record<string, unknown>): Promise<void> {
    await api.post(`/api/prompt-instances/${instanceId}/complete`, outputData)
  }

  // GET /api/prompt-instances/recent/{UserId}
  async getRecent(userId: number): Promise<PromptInstanceDto[]> {
    const { data } = await api.get(`/api/prompt-instances/recent/${userId}`)
    return data
  }

  // GET /api/prompt-instances/status/{status}
  async getByStatus(status: string): Promise<PromptInstanceDto[]> {
    const { data } = await api.get(`/api/prompt-instances/status/${encodeURIComponent(status)}`)
    return data
  }

  // GET /api/prompt-instances/template/{templateId}
  async getByTemplate(templateId: number): Promise<PromptInstanceDto[]> {
    const { data } = await api.get(`/api/prompt-instances/template/${templateId}`)
    return data
  }

  // GET /api/prompt-instances/user/{UserId}
  async getByUser(userId: number): Promise<PromptInstanceDto[]> {
    const { data } = await api.get(`/api/prompt-instances/user/${userId}`)
    return data
  }

  // Details
  async getDetails(instanceId: number): Promise<PromptInstanceDetailDto[]> {
    const { data } = await api.get(`/api/prompt-instances/${instanceId}/details`)
    return data
  }

  async createDetail(instanceId: number, payload: Omit<PromptInstanceDetailDto, 'detailId'>): Promise<PromptInstanceDetailDto> {
    const { data } = await api.post(`/api/prompt-instances/${instanceId}/details`, payload)
    return data
  }

  async updateDetail(instanceId: number, detailId: number, payload: Partial<PromptInstanceDetailDto>): Promise<PromptInstanceDetailDto> {
    const { data } = await api.put(`/api/prompt-instances/${instanceId}/details/${detailId}`, payload)
    return data
  }

  async deleteDetail(instanceId: number, detailId: number): Promise<void> {
    await api.delete(`/api/prompt-instances/${instanceId}/details/${detailId}`)
  }
}

export const promptInstanceService = new PromptInstanceService()

