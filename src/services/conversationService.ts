import { api } from '@/lib/api'

export interface Conversation {
  conversationId: number
  userId: number
  title?: string
  createdAt: string
  [key: string]: any
}

export interface CreateConversationRequest {
  title?: string
}

class ConversationService {
  // POST /api/Conversation
  async createConversation(request: CreateConversationRequest): Promise<Conversation> {
    const { data } = await api.post('/api/Conversation', request)
    return data
  }

  // GET /api/Conversation/{id}
  async getConversationById(id: number): Promise<Conversation> {
    const { data } = await api.get(`/api/Conversation/${id}`)
    return data
  }

  // PUT /api/Conversation/{id}
  async updateConversation(id: number, request: Partial<CreateConversationRequest>): Promise<Conversation> {
    const { data } = await api.put(`/api/Conversation/${id}`, request)
    return data
  }

  // DELETE /api/Conversation/{id}
  async deleteConversation(id: number): Promise<void> {
    await api.delete(`/api/Conversation/${id}`)
  }

  // GET /api/Conversation/user/{UserId}
  async getConversationsByUserId(userId: number): Promise<Conversation[]> {
    const { data } = await api.get(`/api/Conversation/user/${userId}`)
    return data
  }

  // GET /api/Conversation/user/{UserId}/recent
  async getRecentConversations(userId: number): Promise<Conversation[]> {
    const { data } = await api.get(`/api/Conversation/user/${userId}/recent`)
    return data
  }
}

export const conversationService = new ConversationService()

