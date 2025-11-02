import { api } from '@/lib/api'

export interface Feedback {
  feedbackId: number
  postId: number
  userId: number
  content?: string  // May not be in response
  comment?: string  // Backend returns 'comment' in FeedbackDto
  rating: number
  createdAt: string
  createdDate?: string  // Alternative field name
  [key: string]: any
}

export interface CreateFeedbackRequest {
  postId?: number        // Optional - for backward compatibility
  storageId?: number     // Recommended - for StorageTemplate reviews
  content?: string       // Keep for backward compatibility
  comment?: string       // Backend expects 'comment'
  rating: number
}

export interface UpdateFeedbackRequest {
  content?: string
  rating?: number
}

class FeedbackService {
  // POST /api/feedbacks - Tạo phản hồi mới
  async createFeedback(request: CreateFeedbackRequest): Promise<Feedback> {
    console.log('[FeedbackService] Creating feedback with request:', request)
    try {
      const { data } = await api.post('/api/feedbacks', request)
      console.log('[FeedbackService] Feedback created successfully:', data)
      return data
    } catch (e: any) {
      console.error('[FeedbackService] Failed to create feedback:', {
        error: e,
        response: e?.response,
        status: e?.response?.status,
        data: e?.response?.data,
        message: e?.response?.data?.message,
        request
      })
      throw e
    }
  }

  // GET /api/feedbacks/{id} - Lấy chi tiết phản hồi
  async getFeedbackById(id: number): Promise<Feedback> {
    const { data } = await api.get(`/api/feedbacks/${id}`)
    return data
  }

  // PUT /api/feedbacks/{id} - Cập nhật phản hồi
  async updateFeedback(id: number, request: UpdateFeedbackRequest): Promise<Feedback> {
    const { data } = await api.put(`/api/feedbacks/${id}`, request)
    return data
  }

  // DELETE /api/feedbacks/{id} - Xóa phản hồi
  async deleteFeedback(id: number): Promise<void> {
    await api.delete(`/api/feedbacks/${id}`)
  }

  // GET /api/feedbacks/post/{PostId} - Get feedback by post ID
  async getFeedbackByPostId(postId: number): Promise<Feedback[]> {
    try {
      const { data } = await api.get(`/api/feedbacks/post/${postId}`)
      return data
    } catch (e: any) {
      // Return empty array on 404 (no feedbacks yet)
      if (e?.response?.status === 404) {
        return []
      }
      throw e
    }
  }

  // GET /api/feedbacks/post/{PostId}/count - Lấy số lượng phản hồi của bài đăng
  async getFeedbackCount(postId: number): Promise<number> {
    try {
      const { data } = await api.get(`/api/feedbacks/post/${postId}/count`)
      // Backend may return {count: 5} or just 5
      if (typeof data === 'object' && data !== null && 'count' in data) {
        return Number(data.count) || 0
      }
      return Number(data) || 0
    } catch (e: any) {
      // Return 0 on 404 (no feedbacks yet)
      if (e?.response?.status === 404) {
        return 0
      }
      throw e
    }
  }

  // GET /api/feedbacks/post/{PostId}/rating - Lấy đánh giá trung bình của bài đăng
  async getAverageRating(postId: number): Promise<number> {
    try {
      const { data } = await api.get(`/api/feedbacks/post/${postId}/rating`)
      // Backend may return {rating: 4.5} or just 4.5
      if (typeof data === 'object' && data !== null && 'rating' in data) {
        return Number(data.rating) || 0
      }
      return Number(data) || 0
    } catch (e: any) {
      // Return 0 on 404 (no feedbacks yet)
      if (e?.response?.status === 404) {
        return 0
      }
      throw e
    }
  }

  // GET /api/feedbacks/post/{PostId}/recent - Lấy phản hồi gần đây
  async getRecentFeedback(postId: number): Promise<Feedback[]> {
    try {
      const { data } = await api.get(`/api/feedbacks/post/${postId}/recent`)
      return data
    } catch (e: any) {
      // Return empty array on 404 (no feedbacks yet)
      if (e?.response?.status === 404) {
        return []
      }
      throw e
    }
  }

  // GET /api/feedbacks/user/{UserId} - Get feedback by user ID
  async getFeedbackByUserId(userId: number): Promise<Feedback[]> {
    try {
      const { data } = await api.get(`/api/feedbacks/user/${userId}`)
      return data
    } catch (e: any) {
      // Return empty array on 404 (no feedbacks yet)
      if (e?.response?.status === 404) {
        return []
      }
      throw e
    }
  }
}

export const feedbackService = new FeedbackService()

