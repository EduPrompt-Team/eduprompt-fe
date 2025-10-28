import { api } from '@/lib/api'

export interface PromptInstance {
  instanceId: number
  templateId: number
  userId: number
  status: string
  inputData?: string
  outputData?: string
  createdAt: string
  completedAt?: string
  [key: string]: any
}

export interface CreatePromptInstanceRequest {
  templateId: number
  inputData?: string
}

export interface UpdatePromptInstanceRequest {
  inputData?: string
  status?: string
}

export interface CompleteInstanceRequest {
  outputData: string
}

class PromptInstanceService {
  // POST /api/PromptInstance
  async createInstance(request: CreatePromptInstanceRequest): Promise<PromptInstance> {
    const { data } = await api.post('/api/PromptInstance', request)
    return data
  }

  // GET /api/PromptInstance/{InstanceId}
  async getInstanceById(instanceId: number): Promise<PromptInstance> {
    const { data } = await api.get(`/api/PromptInstance/${instanceId}`)
    return data
  }

  // PUT /api/PromptInstance/{InstanceId}
  async updateInstance(instanceId: number, request: UpdatePromptInstanceRequest): Promise<PromptInstance> {
    const { data } = await api.put(`/api/PromptInstance/${instanceId}`, request)
    return data
  }

  // DELETE /api/PromptInstance/{InstanceId}
  async deleteInstance(instanceId: number): Promise<void> {
    await api.delete(`/api/PromptInstance/${instanceId}`)
  }

  // POST /api/PromptInstance/{InstanceId}/complete
  async completeInstance(instanceId: number, request: CompleteInstanceRequest): Promise<PromptInstance> {
    const { data } = await api.post(`/api/PromptInstance/${instanceId}/complete`, request)
    return data
  }

  // GET /api/PromptInstance/recent/{UserId}
  async getRecentInstances(userId: number): Promise<PromptInstance[]> {
    const { data } = await api.get(`/api/PromptInstance/recent/${userId}`)
    return data
  }

  // GET /api/PromptInstance/status/{status}
  async getInstancesByStatus(status: string): Promise<PromptInstance[]> {
    const { data } = await api.get(`/api/PromptInstance/status/${status}`)
    return data
  }

  // GET /api/PromptInstance/template/{templateId}
  async getInstancesByTemplate(templateId: number): Promise<PromptInstance[]> {
    const { data } = await api.get(`/api/PromptInstance/template/${templateId}`)
    return data
  }

  // GET /api/PromptInstance/user/{UserId}
  async getInstancesByUserId(userId: number): Promise<PromptInstance[]> {
    const { data } = await api.get(`/api/PromptInstance/user/${userId}`)
    return data
  }
}

export const promptInstanceService = new PromptInstanceService()

