import { api } from '@/lib/api'
import type { MessageDto } from '@/types/dto/conversation'

class MessageService {
  // POST /api/messages
  async send(payload: Omit<MessageDto, 'messageId' | 'sentAt' | 'isRead' | 'status'> & { status?: string }): Promise<MessageDto> {
    const { data } = await api.post('/api/messages', payload)
    return data
  }

  // GET /api/messages/{id}
  async getById(id: number): Promise<MessageDto> {
    const { data } = await api.get(`/api/messages/${id}`)
    return data
  }

  // PUT /api/messages/{id}
  async update(id: number, payload: Partial<Pick<MessageDto, 'content' | 'status' | 'isRead'>>): Promise<MessageDto> {
    const { data } = await api.put(`/api/messages/${id}`, payload)
    return data
  }

  // DELETE /api/messages/{id}
  async remove(id: number): Promise<void> {
    await api.delete(`/api/messages/${id}`)
  }

  // GET /api/messages/conversation/{ConversationId}
  async getByConversation(conversationId: number): Promise<MessageDto[]> {
    const { data } = await api.get(`/api/messages/conversation/${conversationId}`)
    return data
  }

  // GET /api/messages/conversation/{ConversationId}/last
  async getLast(conversationId: number): Promise<MessageDto> {
    const { data } = await api.get(`/api/messages/conversation/${conversationId}/last`)
    return data
  }

  // GET /api/messages/conversation/{ConversationId}/recent
  async getRecent(conversationId: number): Promise<MessageDto[]> {
    const { data } = await api.get(`/api/messages/conversation/${conversationId}/recent`)
    return data
  }
}

export const messageService = new MessageService()

