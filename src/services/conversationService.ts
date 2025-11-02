import { api } from '@/lib/api'
import type { ConversationDto, MessageDto } from '@/types/dto/conversation'

class ConversationService {
  // POST /api/conversations
  async create(payload: { title?: string | null }): Promise<ConversationDto> {
    const { data } = await api.post('/api/conversations', payload)
    return data
  }

  // GET /api/conversations/{id}
  async getById(conversationId: number): Promise<ConversationDto> {
    const { data } = await api.get(`/api/conversations/${conversationId}`)
    return data
  }

  // PUT /api/conversations/{id}
  async update(conversationId: number, payload: Partial<Pick<ConversationDto, 'title' | 'status'>>): Promise<ConversationDto> {
    const { data } = await api.put(`/api/conversations/${conversationId}`, payload)
    return data
  }

  // DELETE /api/conversations/{id}
  async remove(conversationId: number): Promise<void> {
    await api.delete(`/api/conversations/${conversationId}`)
  }

  // GET /api/conversations/user/{UserId}
  async getByUserId(userId: number): Promise<ConversationDto[]> {
    const { data } = await api.get(`/api/conversations/user/${userId}`)
    return data
  }

  // GET /api/conversations/user/{UserId}/recent
  async getRecent(userId: number): Promise<ConversationDto[]> {
    const { data } = await api.get(`/api/conversations/user/${userId}/recent`)
    return data
  }

  // Messages in a conversation
  async getMessages(conversationId: number): Promise<MessageDto[]> {
    const { data } = await api.get(`/api/messages/conversation/${conversationId}`)
    return data
  }
}

export const conversationService = new ConversationService()

