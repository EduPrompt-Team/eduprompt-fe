import { ConversationStatus } from '@/types/status'

export interface ConversationDto {
  conversationId: number
  userId: number
  title?: string | null
  startedAt: string
  lastActivity?: string | null
  status?: ConversationStatus | null
}


