import { api } from '@/lib/api'

export interface Feedback {
  feedbackId: number
  postId: number
  userId: number
  content: string
  rating: number
  createdAt: string
  [key: string]: any
}

export interface CreateFeedbackRequest {
  postId: number
  content: string
  rating: number
}

export interface UpdateFeedbackRequest {
  content?: string
  rating?: number
}

class FeedbackService {
  // POST /api/Feedback
  async createFeedback(request: CreateFeedbackRequest): Promise<Feedback> {
    const { data } = await api.post('/api/Feedback', request)
    return data
  }

  // GET /api/Feedback/{id}
  async getFeedbackById(id: number): Promise<Feedback> {
    const { data } = await api.get(`/api/Feedback/${id}`)
    return data
  }

  // PUT /api/Feedback/{id}
  async updateFeedback(id: number, request: UpdateFeedbackRequest): Promise<Feedback> {
    const { data } = await api.put(`/api/Feedback/${id}`, request)
    return data
  }

  // DELETE /api/Feedback/{id}
  async deleteFeedback(id: number): Promise<void> {
    await api.delete(`/api/Feedback/${id}`)
  }

  // GET /api/Feedback/post/{PostId}
  async getFeedbackByPostId(postId: number): Promise<Feedback[]> {
    const { data } = await api.get(`/api/Feedback/post/${postId}`)
    return data
  }

  // GET /api/Feedback/post/{PostId}/count
  async getFeedbackCount(postId: number): Promise<number> {
    const { data } = await api.get(`/api/Feedback/post/${postId}/count`)
    return data
  }

  // GET /api/Feedback/post/{PostId}/rating
  async getAverageRating(postId: number): Promise<number> {
    const { data } = await api.get(`/api/Feedback/post/${postId}/rating`)
    return data
  }

  // GET /api/Feedback/post/{PostId}/recent
  async getRecentFeedback(postId: number): Promise<Feedback[]> {
    const { data } = await api.get(`/api/Feedback/post/${postId}/recent`)
    return data
  }

  // GET /api/Feedback/user/{UserId}
  async getFeedbackByUserId(userId: number): Promise<Feedback[]> {
    const { data } = await api.get(`/api/Feedback/user/${userId}`)
    return data
  }
}

export const feedbackService = new FeedbackService()

