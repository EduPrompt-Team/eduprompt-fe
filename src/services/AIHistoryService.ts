import { api } from '@/lib/api'

export interface AIHistory {
  historyId: number
  instanceId: number
  userId: number
  promptText: string
  responseText: string
  createdAt: string
  [key: string]: any
}

export interface CreateAIHistoryRequest {
  instanceId: number
  promptText: string
  responseText: string
}

export interface UpdateAIHistoryRequest {
  promptText?: string
  responseText?: string
}

class AIHistoryService {
  // GET /api/AIHistory
  async getAllHistory(): Promise<AIHistory[]> {
    const { data } = await api.get('/api/AIHistory')
    return data
  }

  // POST /api/AIHistory
  async createHistory(request: CreateAIHistoryRequest): Promise<AIHistory> {
    const { data } = await api.post('/api/AIHistory', request)
    return data
  }

  // GET /api/AIHistory/{id}
  async getHistoryById(id: number): Promise<AIHistory> {
    const { data } = await api.get(`/api/AIHistory/${id}`)
    return data
  }

  // PUT /api/AIHistory/{id}
  async updateHistory(id: number, request: UpdateAIHistoryRequest): Promise<AIHistory> {
    const { data } = await api.put(`/api/AIHistory/${id}`, request)
    return data
  }

  // DELETE /api/AIHistory/{id}
  async deleteHistory(id: number): Promise<void> {
    await api.delete(`/api/AIHistory/${id}`)
  }

  // GET /api/AIHistory/instance/{InstanceId}
  async getHistoryByInstanceId(instanceId: number): Promise<AIHistory[]> {
    const { data } = await api.get(`/api/AIHistory/instance/${instanceId}`)
    return data
  }

  // GET /api/AIHistory/user/{UserId}
  async getHistoryByUserId(userId: number): Promise<AIHistory[]> {
    const { data } = await api.get(`/api/AIHistory/user/${userId}`)
    return data
  }

  // GET /api/AIHistory/user/{UserId}/recent
  async getRecentHistory(userId: number): Promise<AIHistory[]> {
    const { data } = await api.get(`/api/AIHistory/user/${userId}/recent`)
    return data
  }

  // GET /api/AIHistory/user/{UserId}/stats
  async getHistoryStats(userId: number): Promise<any> {
    const { data } = await api.get(`/api/AIHistory/user/${userId}/stats`)
    return data
  }
}

export const aiHistoryService = new AIHistoryService()

