import { ConversationStatus, MessageStatus } from '@/types/status'

export interface ConversationDto {
  conversationId: number
  userId: number
  title?: string | null
  startedAt: string
  lastActivity?: string | null
  status?: ConversationStatus | null
}

export interface MessageDto {
  messageId: number
  conversationId: number
  senderType: string
  content: string
  sentAt: string
  isRead: boolean
  status?: MessageStatus | null
}


