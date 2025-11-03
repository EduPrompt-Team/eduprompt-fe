import { feedbackService, type Feedback, type CreateFeedbackRequest, type UpdateFeedbackRequest } from '@/services/feedbackService'

export interface Review {
  reviewId: number
  storageId: number
  userId: number
  rating: number
  comment: string
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

/**
 * Helper to convert Feedback to Review format
 */
function feedbackToReview(feedback: Feedback, storageId: number): Review {
  return {
    ...feedback,
    reviewId: feedback.feedbackId,
    storageId: storageId,
    userId: feedback.userId,
    rating: feedback.rating,
    // Use 'comment' first, fallback to 'content' for backward compatibility
    comment: feedback.comment || feedback.content || '',
    createdAt: feedback.createdAt || feedback.createdDate || new Date().toISOString(),
    updatedAt: feedback.createdAt || feedback.createdDate, // Use createdAt as fallback if no updatedAt
    user: (feedback as any).user
  }
}

/**
 * Helper to convert Review request to Feedback request
 * Backend now supports storageId directly (recommended) or postId (backward compatible)
 */
function reviewToFeedbackRequest(request: CreateReviewRequest): CreateFeedbackRequest {
  return {
    storageId: request.storageId,  // Preferred new field
    packageId: request.packageId,
    comment: request.comment,     // Backend expects 'comment'
    rating: request.rating
  }
}

class ReviewService {
  // POST /api/reviews -> Uses /api/Feedback
  async createReview(request: CreateReviewRequest): Promise<Review> {
    const feedbackRequest = reviewToFeedbackRequest(request)
    const feedback = await feedbackService.createFeedback(feedbackRequest)
    return feedbackToReview(feedback, request.storageId)
  }

  // GET /api/reviews/{id} -> Uses /api/Feedback/{id}
  async getReviewById(id: number): Promise<Review> {
    const feedback = await feedbackService.getFeedbackById(id)
    // Note: We need storageId from the request context, but we only have feedbackId
    // Assuming feedback.postId is the storageId
    return feedbackToReview(feedback, feedback.postId)
  }

  // PUT /api/reviews/{id} -> Uses /api/Feedback/{id}
  async updateReview(id: number, request: UpdateReviewRequest): Promise<Review> {
    const updateRequest: UpdateFeedbackRequest = {
      rating: request.rating,
      content: request.comment
    }
    const feedback = await feedbackService.updateFeedback(id, updateRequest)
    return feedbackToReview(feedback, feedback.postId)
  }

  // DELETE /api/reviews/{id} -> Uses /api/Feedback/{id}
  async deleteReview(id: number): Promise<void> {
    await feedbackService.deleteFeedback(id)
  }

  // GET /api/reviews/storage/{storageId} -> Uses /api/Feedback/post/{postId}
  async getReviewsByStorageId(storageId: number): Promise<Review[]> {
    try {
      const feedbacks: any = await feedbackService.getFeedbackByStorageId(storageId)
      // Normalize and map only storage-based results
      const array:
        any[] = Array.isArray(feedbacks)
          ? feedbacks
          : (typeof feedbacks === 'object' && feedbacks !== null && 'feedbackId' in feedbacks)
            ? [feedbacks]
            : (typeof feedbacks === 'object' && feedbacks !== null && Array.isArray((feedbacks as any).items))
              ? (feedbacks as any).items
              : (typeof feedbacks === 'object' && feedbacks !== null && Array.isArray((feedbacks as any).data))
                ? (feedbacks as any).data
                : []

      // Temporary safety net: if BE list unexpectedly empty, try legacy /post/{id}
      if (!Array.isArray(array) || array.length === 0) {
        try {
          const legacy: any = await feedbackService.getFeedbackByPostId(storageId)
          const legacyArr: any[] = Array.isArray(legacy)
            ? legacy
            : (legacy && typeof legacy === 'object' && 'feedbackId' in legacy) ? [legacy]
            : (legacy && typeof legacy === 'object' && Array.isArray(legacy.items)) ? legacy.items
            : (legacy && typeof legacy === 'object' && Array.isArray(legacy.data)) ? legacy.data
            : []
          if (legacyArr.length > 0) {
            return legacyArr.map((fb: any) => feedbackToReview(fb, storageId))
          }
        } catch {
          // ignore
        }
      }

      return array.map(fb => feedbackToReview(fb, storageId))
    } catch (e: any) {
      // Return empty array on 404 (no reviews yet)
      if (e?.response?.status === 404) {
        return []
      }
      throw e
    }
  }

  // GET /api/reviews/storage/{storageId}/rating -> Uses /api/Feedback/post/{postId}/rating
  async getAverageRating(storageId: number): Promise<number> {
    try {
      return await feedbackService.getAverageRatingByStorageId(storageId)
    } catch (e: any) {
      // Return 0 on 404 (no reviews yet)
      if (e?.response?.status === 404) {
        return 0
      }
      throw e
    }
  }

  // GET /api/reviews/storage/{storageId}/count -> Uses /api/Feedback/post/{postId}/count
  async getReviewCount(storageId: number): Promise<number> {
    try {
      return await feedbackService.getFeedbackCountByStorageId(storageId)
    } catch (e: any) {
      // Return 0 on 404 (no reviews yet)
      if (e?.response?.status === 404) {
        return 0
      }
      throw e
    }
  }

  // GET /api/reviews/user/{userId} -> Uses /api/Feedback/user/{userId}
  async getReviewsByUserId(userId: number): Promise<Review[]> {
    try {
      const feedbacks = await feedbackService.getFeedbackByUserId(userId)
      return feedbacks.map(fb => feedbackToReview(fb, fb.postId))
    } catch (e: any) {
      if (e?.response?.status === 404) {
        return []
      }
      throw e
    }
  }

  // GET /api/reviews/user/{userId}/storage/{storageId}
  // This needs to be implemented differently - get all user feedbacks and filter by postId
  async getUserReviewForStorage(userId: number, storageId: number): Promise<Review | null> {
    // Avoid extra endpoint: load by storageId then filter by user
    const reviews = await this.getReviewsByStorageId(storageId)
    const match = reviews.find(r => r.userId === userId) || null
    return match
  }

  // GET /api/reviews (admin only - all reviews)
  // Since Feedback API doesn't have getAllFeedbacks endpoint,
  // we fetch all storage templates and get reviews for each
  async getAllReviews(): Promise<Review[]> {
    try {
      // Import storageTemplateService dynamically to avoid circular dependency
      const { storageTemplateService } = await import('@/services/storageTemplateService')
      
      // Fetch all public templates to get all storageIds
      const allTemplates = await storageTemplateService.getPublicTemplates({}).catch(() => [])
      const templatesArray = Array.isArray(allTemplates) ? allTemplates : []
      
      // Fetch all reviews for all storage templates
      const reviewPromises = templatesArray.map((template: any) => {
        const storageId = template.storageId || template.id
        if (!storageId) return Promise.resolve([])
        return this.getReviewsByStorageId(storageId).catch(() => [])
      })
      
      const allReviewsArrays = await Promise.all(reviewPromises)
      // Flatten array of arrays into single array
      const allReviews = allReviewsArrays.flat()
      
      // Also fetch from my-storage templates
      try {
        const myTemplates = await storageTemplateService.getMyStorage().catch(() => [])
        const myTemplatesArray = Array.isArray(myTemplates) ? myTemplates : []
        const myReviewPromises = myTemplatesArray.map((template: any) => {
          const storageId = template.storageId || template.id
          if (!storageId) return Promise.resolve([])
          return this.getReviewsByStorageId(storageId).catch(() => [])
        })
        const myReviewsArrays = await Promise.all(myReviewPromises)
        const myReviews = myReviewsArrays.flat()
        allReviews.push(...myReviews)
      } catch (e) {
        console.warn('[ReviewService] Failed to load reviews from my-storage:', e)
      }
      
      // Remove duplicates by reviewId
      const uniqueReviews = allReviews.reduce((acc, review) => {
        if (!acc.find((r: Review) => r.reviewId === review.reviewId)) {
          acc.push(review)
        }
        return acc
      }, [] as Review[])
      
      return uniqueReviews
    } catch (e: any) {
      console.error('[ReviewService] Failed to getAllReviews:', e)
      return []
    }
  }
}

export const reviewService = new ReviewService()

