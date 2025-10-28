import { MessageStatus } from '@/types/status'

export interface MessageDto {
  messageId: number
  conversationId: number
  senderType: string
  content: string
  sentAt: string
  isRead: boolean
  status?: MessageStatus | null
}


