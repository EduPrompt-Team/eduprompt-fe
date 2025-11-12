import { api } from '@/lib/api'

export interface Review {
  reviewId: number
  storageId: number
  userId: number
  rating: number
  comment: string
  packageId?: number | null
  createdAt: string
  updatedAt?: string
  user?: {
    userId: number
    fullName?: string
    email?: string
    avatar?: string
  }
  [key: string]: any
}

export interface CreateReviewRequest {
  storageId: number
  rating: number
  comment: string
  packageId?: number
}

export interface UpdateReviewRequest {
  rating?: number
  comment?: string
}

class ReviewService {
  private normalizeReview = (review: any): Review => {
    if (!review) return review
    return {
      ...review,
      packageId: review.packageId ?? review.packageID ?? null,
      comment: typeof review.comment === 'string' ? review.comment : review.content ?? '',
      user: review.user
        ? {
            userId: review.user.userId ?? review.user.id ?? review.userId,
            fullName: review.user.fullName ?? review.user.name ?? review.userFullName,
            email: review.user.email ?? review.userEmail,
            avatar: review.user.avatar ?? review.userAvatar,
          }
        : review.userId
          ? {
              userId: review.userId,
              fullName: review.userFullName,
              email: review.userEmail,
            }
          : undefined,
    }
  }

  // POST /api/reviews - Create a new review
  async createReview(request: CreateReviewRequest): Promise<Review> {
    console.log('[ReviewService] Creating review with request:', request)
    try {
      const { data } = await api.post('/api/reviews', request)
      console.log('[ReviewService] Review created successfully:', data)
      return this.normalizeReview(data)
    } catch (e: any) {
      console.error('[ReviewService] Failed to create review:', {
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

  // GET /api/reviews/{id} - Get review by ID
  async getReviewById(id: number): Promise<Review> {
    try {
      const { data } = await api.get(`/api/reviews/${id}`)
      return this.normalizeReview(data)
    } catch (e: any) {
      if (e?.response?.status === 404) {
        throw new Error('Review not found')
      }
      throw e
    }
  }

  // PUT /api/reviews/{id} - Update review
  async updateReview(id: number, request: UpdateReviewRequest): Promise<Review> {
    console.log('[ReviewService] Updating review:', id, request)
    try {
      const { data } = await api.put(`/api/reviews/${id}`, request)
      console.log('[ReviewService] Review updated successfully:', data)
      return this.normalizeReview(data)
    } catch (e: any) {
      console.error('[ReviewService] Failed to update review:', {
        error: e,
        response: e?.response,
        status: e?.response?.status,
        data: e?.response?.data
      })
      throw e
    }
  }

  // DELETE /api/reviews/{id} - Delete review
  async deleteReview(id: number): Promise<void> {
    console.log('[ReviewService] Deleting review:', id)
    try {
      await api.delete(`/api/reviews/${id}`)
      console.log('[ReviewService] Review deleted successfully')
    } catch (e: any) {
      console.error('[ReviewService] Failed to delete review:', {
        error: e,
        response: e?.response,
        status: e?.response?.status,
        data: e?.response?.data
      })
      throw e
    }
  }

  // GET /api/reviews/storage/{storageId} - Get all reviews for a storage template
  async getReviewsByStorageId(storageId: number): Promise<Review[]> {
    try {
      const { data } = await api.get(`/api/reviews/storage/${storageId}`)
      // Normalize response - backend may return array directly or wrapped
      if (Array.isArray(data)) {
        return data.map(this.normalizeReview)
      }
      if (data && typeof data === 'object') {
        if (Array.isArray(data.items)) return data.items.map(this.normalizeReview)
        if (Array.isArray(data.data)) return data.data.map(this.normalizeReview)
        if ('reviewId' in data) return [this.normalizeReview(data as Review)]
      }
      return []
    } catch (e: any) {
      // Return empty array on 404 (no reviews yet)
      if (e?.response?.status === 404) {
        console.log('[ReviewService] No reviews found for storageId:', storageId)
        return []
      }
      console.error('[ReviewService] Failed to get reviews by storageId:', e)
      throw e
    }
  }

  // GET /api/reviews/storage/{storageId}/rating - Get average rating
  async getAverageRating(storageId: number): Promise<number> {
    try {
      const { data } = await api.get(`/api/reviews/storage/${storageId}/rating`)
      // Backend may return {rating: 4.5} or just 4.5
      if (typeof data === 'object' && data !== null && 'rating' in data) {
        return Number(data.rating) || 0
      }
      return Number(data) || 0
    } catch (e: any) {
      // Return 0 on 404 (no reviews yet)
      if (e?.response?.status === 404) {
        return 0
      }
      console.warn('[ReviewService] Failed to get average rating:', e)
      return 0
    }
  }

  // GET /api/reviews/storage/{storageId}/count - Get review count
  async getReviewCount(storageId: number): Promise<number> {
    try {
      const { data } = await api.get(`/api/reviews/storage/${storageId}/count`)
      // Backend may return {count: 5} or just 5
      if (typeof data === 'object' && data !== null && 'count' in data) {
        return Number(data.count) || 0
      }
      return Number(data) || 0
    } catch (e: any) {
      // Return 0 on 404 (no reviews yet)
      if (e?.response?.status === 404) {
        return 0
      }
      console.warn('[ReviewService] Failed to get review count:', e)
      return 0
    }
  }

  // GET /api/reviews/user/{userId} - Get all reviews by user
  async getReviewsByUserId(userId: number): Promise<Review[]> {
    try {
      const { data } = await api.get(`/api/reviews/user/${userId}`)
      if (Array.isArray(data)) {
        return data.map(this.normalizeReview)
      }
      if (typeof data === 'object' && data !== null) {
        if (Array.isArray(data.items)) return data.items.map(this.normalizeReview)
        if (Array.isArray(data.data)) return data.data.map(this.normalizeReview)
        if ('reviewId' in data) return [this.normalizeReview(data as Review)]
      }
      return []
    } catch (e: any) {
      if (e?.response?.status === 404) {
        return []
      }
      throw e
    }
  }

  // GET /api/reviews/user/{userId}/storage/{storageId} - Get user's review for a specific storage
  async getUserReviewForStorage(userId: number, storageId: number): Promise<Review | null> {
    try {
      const { data } = await api.get(`/api/reviews/user/${userId}/storage/${storageId}`)
      // Backend returns the review or null/404 if not found
      if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
        return null
      }
      return this.normalizeReview(data)
    } catch (e: any) {
      // Return null on 404 (user hasn't reviewed yet)
      if (e?.response?.status === 404) {
        return null
      }
      console.warn('[ReviewService] Failed to get user review for storage:', e)
      return null
    }
  }

  // GET /api/reviews (admin only - all reviews)
  async getAllReviews(): Promise<Review[]> {
    try {
      const { data } = await api.get('/api/reviews')
      if (Array.isArray(data)) {
        return data.map(this.normalizeReview)
      }
      if (typeof data === 'object' && data !== null) {
        if (Array.isArray(data.items)) return data.items.map(this.normalizeReview)
        if (Array.isArray(data.data)) return data.data.map(this.normalizeReview)
      }
      return []
    } catch (e: any) {
      console.error('[ReviewService] Failed to getAllReviews:', e)
      // Return empty array on error (admin might not have permission)
      if (e?.response?.status === 404 || e?.response?.status === 403) {
        return []
      }
      throw e
    }
  }
}

export const reviewService = new ReviewService()


