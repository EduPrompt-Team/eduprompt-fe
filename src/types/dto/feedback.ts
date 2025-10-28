import { FeedbackStatus } from '@/types/status'

export interface FeedbackDto {
  feedbackId: number
  postId: number
  userId: number
  packageId?: number | null
  rating: number
  comment?: string | null
  createdDate: string
  isVerified: boolean
  status?: FeedbackStatus | null
}


