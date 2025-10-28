import { api } from '@/lib/api'

export interface Message {
  messageId: number
  conversationId: number
  content: string
  isUserMessage: boolean
  createdAt: string
  [key: string]: any
}

export interface CreateMessageRequest {
  conversationId: number
  content: string
  isUserMessage: boolean
}

class MessageService {
  // POST /api/Message
  async sendMessage(request: CreateMessageRequest): Promise<Message> {
    const { data } = await api.post('/api/Message', request)
    return data
  }

  // GET /api/Message/{id}
  async getMessageById(id: number): Promise<Message> {
    const { data } = await api.get(`/api/Message/${id}`)
    return data
  }

  // PUT /api/Message/{id}
  async updateMessage(id: number, request: Partial<CreateMessageRequest>): Promise<Message> {
    const { data } = await api.put(`/api/Message/${id}`, request)
    return data
  }

  // DELETE /api/Message/{id}
  async deleteMessage(id: number): Promise<void> {
    await api.delete(`/api/Message/${id}`)
  }

  // GET /api/Message/conversation/{ConversationId}
  async getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    const { data } = await api.get(`/api/Message/conversation/${conversationId}`)
    return data
  }

  // GET /api/Message/conversation/{ConversationId}/last
  async getLastMessage(conversationId: number): Promise<Message> {
    const { data } = await api.get(`/api/Message/conversation/${conversationId}/last`)
    return data
  }

  // GET /api/Message/conversation/{ConversationId}/recent
  async getRecentMessages(conversationId: number): Promise<Message[]> {
    const { data } = await api.get(`/api/Message/conversation/${conversationId}/recent`)
    return data
  }
}

export const messageService = new MessageService()

