import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useMemo, useCallback } from 'react'
import { storageTemplateService } from '@/services/storageTemplateService'
import { feedbackService } from '@/services/feedbackService'
import { wishlistService } from '@/services/wishlistService'
import { orderService } from '@/services/orderService'
import { paymentService } from '@/services/paymentService'
import { userService } from '@/services/userService'
import { packageService } from '@/services/packageService'
import { getCurrentUser } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import SiderBar from '@/components/ProfileUser/SiderBar'
import HeaderHomepage from '@/components/Layout/HeaderHomepage'
import HeaderGrade from '@/components/Layout/HeaderGrade'
import { Button } from '@/components/ui/button'
import { Heart, Download, Eye, Check } from 'lucide-react'
import type { StorageTemplate } from '@/services/storageTemplateService'
import type { Feedback } from '@/services/feedbackService'

// Type alias để tương thích với code cũ
type Review = Feedback & {
  reviewId: number // Map từ feedbackId
  comment: string // Map từ comment hoặc content
}

// Helper function to convert Feedback to Review format
const feedbackToReview = (feedback: Feedback): Review => {
  return {
    ...feedback,
    reviewId: feedback.feedbackId,
    comment: feedback.comment || feedback.content || '',
    createdAt: feedback.createdAt || feedback.createdDate || new Date().toISOString(),
  }
}

// Subject name mapping: Vietnamese name -> display name
const subjectDisplayMap: Record<string, string> = {
  'math': 'Toán',
  'physics': 'Vật lý',
  'chemistry': 'Hóa học',
  'biology': 'Sinh học',
  'literature': 'Ngữ văn',
  'history': 'Lịch sử',
  'geography': 'Địa lý',
  'english': 'Tiếng Anh',
  'informatics': 'Tin học',
  'technology': 'Công nghệ',
}

// Grade-specific header components (can be expanded later)
const getHeaderComponent = (grade: string) => {
  switch (grade) {
    case '10':
      return HeaderGrade
    case '11':
      return HeaderGrade
    case '12':
      return HeaderGrade
    default:
      return HeaderHomepage
  }
}

export default function DynamicSubjectDetailRouter() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const params = useParams<{ grade: string; subject: string; chapter: string }>()
  
  // Extract grade from params or pathname (for routes like /grade10/:subject/detail/:chapter)
  let grade = params.grade
  if (!grade) {
    // Try to extract from pathname (e.g., /grade10/math/detail/chuong5 -> "10")
    const pathMatch = window.location.pathname.match(/\/grade(\d+)\//)
    if (pathMatch) {
      grade = pathMatch[1]
      console.log('[DynamicRouter] Extracted grade from pathname:', grade)
    }
  }
  
  const subject = params.subject
  const chapter = params.chapter
  
  const [templates, setTemplates] = useState<StorageTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isInLibrary, setIsInLibrary] = useState(false)
  const [favoriteProcessing, setFavoriteProcessing] = useState(false)
  const [libraryProcessing, setLibraryProcessing] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [checkingPayment, setCheckingPayment] = useState(false)
  const [packageInfo, setPackageInfo] = useState<{ packageId: number; packageName: string } | null>(null)

  // Debug: Log URL params
  useEffect(() => {
    console.log('[DynamicRouter] URL params:', { grade, subject, chapter, fullPath: window.location.pathname, extractedGrade: grade })
  }, [grade, subject, chapter])

  // Review/Feedback states - DISABLED (reviews section removed)
  // const [reviews, setReviews] = useState<Review[]>([])
  // const [averageRating, setAverageRating] = useState<number>(0)
  // const [reviewCount, setReviewCount] = useState<number>(0)
  const [favoriteCount, setFavoriteCount] = useState<number>(0)
  const [viewCount, setViewCount] = useState<number>(0)
  // const [loadingReviews, setLoadingReviews] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  // const [userReview, setUserReview] = useState<Review | null>(null)
  // const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  // const MAX_REVIEW_COMMENT_LENGTH = 5000
  // const [editingReviewId, setEditingReviewId] = useState<number | null>(null)
  // const [showReviewForm, setShowReviewForm] = useState(false)
  // const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  // const [showMenuId, setShowMenuId] = useState<number | null>(null)
  // const [usersMap, setUsersMap] = useState<Map<number, any>>(new Map()) // Map userId -> user info

  // Extract chapter number from chapter param (e.g., "chuong1" -> 1)
  const chapterNum = chapter ? parseInt(chapter.replace('chuong', '')) || 1 : 1
  const chapterText = `Chương ${chapterNum}`
  
  // Map subject key to Vietnamese name
  const subjectName = subjectDisplayMap[subject || ''] || subject || ''
  const gradeNum = grade || '10'

  // Map subject key back to Vietnamese name for API
  const subjectMap: Record<string, string> = {
    'math': 'Toán',
    'physics': 'Vật lý',
    'chemistry': 'Hóa học',
    'biology': 'Sinh học',
    'literature': 'Ngữ văn',
    'history': 'Lịch sử',
    'geography': 'Địa lý',
    'english': 'Tiếng Anh',
    'informatics': 'Tin học',
    'technology': 'Công nghệ',
  }

  const subjectViName = subject ? (subjectMap[subject] || subject) : ''

  // Load current user
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [])

  // Load templates based on URL params
  useEffect(() => {
    if (!grade || !subject) return

    let isMounted = true

    async function loadTemplates() {
      try {
        setLoading(true)
        setError(null)

        // Try to fetch templates - allow both exact match and flexible matching
        let templatesArray: StorageTemplate[] = []
        
        try {
          // First try with exact Vietnamese name
          const data = await storageTemplateService.getPublicTemplates({
            grade: gradeNum as '10' | '11' | '12',
            subject: subjectViName,
            chapter: chapterText,
          })
          templatesArray = Array.isArray(data) ? data : (data as any)?.data || []
          console.log(`[DynamicRouter] Loaded templates (exact match) for grade=${grade}, subject=${subjectViName}, chapter=${chapterText}:`, templatesArray.length)
        } catch (e1) {
          console.warn('[DynamicRouter] Exact match failed, trying without filters:', e1)
          // If exact match fails, try fetching all public templates and filter client-side
          try {
            const allData = await storageTemplateService.getPublicTemplates({})
            const allTemplates = Array.isArray(allData) ? allData : (allData as any)?.data || []
            // Filter by grade, subject, chapter
            templatesArray = allTemplates.filter((t: StorageTemplate) => {
              const tGrade = t.grade || (() => {
                try {
                  const parsed = JSON.parse(t.templateContent || '{}')
                  return parsed.grade
                } catch {
                  return null
                }
              })()
              
              const tSubject = t.subject || (() => {
                try {
                  const parsed = JSON.parse(t.templateContent || '{}')
                  return parsed.subject
                } catch {
                  return null
                }
              })()
              
              const tChapter = t.chapter || (() => {
                try {
                  const parsed = JSON.parse(t.templateContent || '{}')
                  return parsed.chapter
                } catch {
                  return null
                }
              })()
              
              return tGrade === gradeNum && 
                     (tSubject === subjectViName || tSubject?.toLowerCase() === subjectViName?.toLowerCase()) &&
                     (tChapter === chapterText || tChapter?.includes(chapterNum.toString()))
            })
            console.log(`[DynamicRouter] Loaded templates (client-side filter) for grade=${gradeNum}, subject=${subjectViName}, chapter=${chapterText}:`, templatesArray.length)
          } catch (e2) {
            console.error('[DynamicRouter] Both fetch methods failed:', e2)
          }
        }

        if (!isMounted) return

        setTemplates(templatesArray)

        console.log(`[DynamicRouter] Final templates for grade=${grade}, subject=${subject}, chapter=${chapter}:`, templatesArray)
      } catch (e: any) {
        if (!isMounted) return
        console.error('[DynamicRouter] Failed to load templates:', e)
        setError(e?.message ?? 'Không tải được template')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadTemplates()
    return () => {
      isMounted = false
    }
  }, [grade, subject, chapter])

  // Get selected template (first one, or can be enhanced to select specific one)
  const selectedPrompt = useMemo(() => templates[0], [templates])

  // Get storageId for wishlist (required by backend)
  const selectedStorageId = useMemo(() => {
    if (!selectedPrompt) return undefined
    const storageId = selectedPrompt.storageId
    if (storageId && Number.isFinite(storageId) && storageId > 0) {
      return storageId
    }
    return undefined
  }, [selectedPrompt])
  
  // Get packageId for payment check (legacy)
  const selectedPackageId = useMemo(() => {
    if (!selectedPrompt) return undefined
    const rawPackageId = (selectedPrompt as any)?.packageId
    const parsed = typeof rawPackageId === 'number' ? rawPackageId : Number(rawPackageId)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
  }, [selectedPrompt])
  
  // Get actual packageId from template for payment check
  const templatePackageId = useMemo(() => {
    if (!selectedPrompt) return undefined
    const rawPackageId = (selectedPrompt as any)?.packageId
    const parsed = typeof rawPackageId === 'number' ? rawPackageId : Number(rawPackageId)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
  }, [selectedPrompt])

  useEffect(() => {
    if (!selectedStorageId || !currentUser?.userId) {
      setIsFavorite(false)
      setIsInLibrary(false)
      setIsPaid(false)
      return
    }

    let isMounted = true

    ;(async () => {
      // Check wishlist using storageId
      try {
        const fav = await wishlistService.checkInWishlist(selectedStorageId)
        if (isMounted) {
          setIsFavorite(Boolean(fav))
        }
      } catch (err) {
        console.warn('[DynamicRouter] Không kiểm tra được wishlist:', err)
      }

      // Check library using packageId (for backward compatibility)
      try {
        const saved = await storageTemplateService.checkTemplateSaved(selectedPackageId || 0)
        if (isMounted) {
          setIsInLibrary(Boolean(saved))
        }
      } catch (err) {
        console.warn('[DynamicRouter] Không kiểm tra được kho prompt:', err)
      }

      // Check ownership status - use templatePackageId (actual packageId from template)
      if (templatePackageId) {
        try {
          setCheckingPayment(true)
          
          // Sử dụng endpoint mới (backend đã fix)
          let hasPaidPayment = false
          
          try {
            console.log('[DynamicRouter] ✅ Checking package payment status for packageId:', templatePackageId)
            const checkResult = await paymentService.checkPackagePayment(templatePackageId)
            console.log('[DynamicRouter] ✅ checkPackagePayment response:', JSON.stringify(checkResult, null, 2))
            
            // Backend đã fix, tin tưởng kết quả từ endpoint
            hasPaidPayment = checkResult.isPaid === true
            
            if (hasPaidPayment) {
              console.log('[DynamicRouter] ✅ Package is PAID - OrderId:', checkResult.orderId, 'PaymentId:', checkResult.paymentId)
            } else {
              console.log('[DynamicRouter] ℹ️ Package is NOT PAID')
            }
            
            // Set payment status
            if (isMounted) {
              setIsPaid(hasPaidPayment)
              setCheckingPayment(false)
            }
            return
          } catch (endpointErr: any) {
            // Chỉ fallback khi endpoint không tồn tại (404) - không nên xảy ra nữa vì backend đã fix
            if (endpointErr?.message === 'ENDPOINT_NOT_FOUND' || endpointErr?.response?.status === 404) {
              console.warn('[DynamicRouter] ⚠️ Endpoint not available (404), using fallback method')
              // Fallback sẽ chạy ở dưới
            } else {
              // Lỗi khác (network, server error, etc.)
              console.error('[DynamicRouter] ❌ Error checking package payment:', endpointErr)
              console.error('[DynamicRouter] ❌ Error details:', {
                status: endpointErr?.response?.status,
                message: endpointErr?.message,
                data: endpointErr?.response?.data
              })
              // Set false và return để không chạy fallback
              if (isMounted) {
                setIsPaid(false)
                setCheckingPayment(false)
              }
              return
            }
          }
          
          // Fallback: Chỉ chạy khi endpoint không tồn tại (404) - không nên xảy ra nữa vì backend đã fix
          console.log('[DynamicRouter] 🔄 Using fallback method (endpoint not available)...')
          
          // Fallback: Kiểm tra qua orders (backend đã fix, nên có packageId trong orders)
          try {
            console.log('[DynamicRouter] 🔄 Fallback: Checking orders directly...')
            const orders = await orderService.getMyOrders()
            
            // Filter orders có status Completed/Paid
            const completedOrders = orders.filter((order: any) => {
              const status = (order.status || '').toString().toLowerCase()
              return ['completed', 'paid'].includes(status)
            })
            
            // Check packageId trong orders (backend đã fix, nên có packageId)
            for (const order of completedOrders) {
              const orderPackageId = order.packageId || order.packageID
              if (orderPackageId != null && Number(orderPackageId) === Number(templatePackageId)) {
                console.log('[DynamicRouter] ✅ Fallback: Found matching packageId in order:', orderPackageId)
                hasPaidPayment = true
                break
              }
            }
            
            if (isMounted) {
              setIsPaid(hasPaidPayment)
              console.log('[DynamicRouter] ✅ Fallback payment status:', hasPaidPayment)
            }
          } catch (orderErr) {
            console.error('[DynamicRouter] ❌ Fallback: Could not check orders:', orderErr)
            if (isMounted) {
              setIsPaid(false)
            }
          }
        } catch (err) {
          console.warn('[DynamicRouter] Không kiểm tra được payment status:', err)
          if (isMounted) {
            setIsPaid(false)
          }
        } finally {
          if (isMounted) {
            setCheckingPayment(false)
          }
        }
      } else {
        // No packageId in template, cannot check payment
        if (isMounted) {
          setIsPaid(false)
          setCheckingPayment(false)
        }
      }
    })()

    return () => {
      isMounted = false
    }
  }, [selectedStorageId, selectedPackageId, templatePackageId, currentUser?.userId])

  // Load package info when templatePackageId is available
  useEffect(() => {
    if (!templatePackageId) {
      setPackageInfo(null)
      return
    }

    let isMounted = true

    ;(async () => {
      try {
        console.log('[DynamicRouter] Loading package info for packageId:', templatePackageId)
        const pkg = await packageService.getPackageById(templatePackageId)
        if (isMounted) {
          setPackageInfo({
            packageId: pkg.packageId,
            packageName: pkg.packageName || 'Gói không xác định'
          })
          console.log('[DynamicRouter] Package info loaded:', pkg.packageName)
        }
      } catch (err: any) {
        console.warn('[DynamicRouter] Could not load package info:', err)
        if (isMounted) {
          setPackageInfo(null)
        }
      }
    })()

    return () => {
      isMounted = false
    }
  }, [templatePackageId])

  // Listen for payment updates
  useEffect(() => {
    const handlePaymentUpdate = () => {
      // Re-check payment status when payment is updated
      if (templatePackageId && currentUser?.userId) {
        const checkPayment = async () => {
          try {
            setCheckingPayment(true)
            
            // Sử dụng endpoint mới (backend đã fix)
            try {
              console.log('[DynamicRouter] ✅ Payment update: Checking package payment for packageId:', templatePackageId)
              const checkResult = await paymentService.checkPackagePayment(templatePackageId)
              console.log('[DynamicRouter] ✅ Payment update - checkPackagePayment response:', JSON.stringify(checkResult, null, 2))
              
              // Backend đã fix, tin tưởng kết quả từ endpoint
              const hasPaidPayment = checkResult.isPaid === true
              
              setIsPaid(hasPaidPayment)
              setCheckingPayment(false)
              console.log('[DynamicRouter] ✅ Payment status updated:', hasPaidPayment)
            } catch (endpointErr: any) {
              console.error('[DynamicRouter] ❌ Payment update: Error checking package payment:', endpointErr)
              setIsPaid(false)
              setCheckingPayment(false)
            }
          } catch (err) {
            console.warn('[DynamicRouter] Could not check payment status:', err)
            setIsPaid(false)
            setCheckingPayment(false)
          }
        }
        checkPayment()
      }
    }

    window.addEventListener('paymentUpdated', handlePaymentUpdate)
    return () => {
      window.removeEventListener('paymentUpdated', handlePaymentUpdate)
    }
  }, [templatePackageId, currentUser?.userId])

  // Function to load reviews - DISABLED (reviews section removed)
  /*
  const loadReviews = useCallback(
    async (options?: { fallbackReview?: Review }) => {
    if (loading) return
    
    if (!selectedPrompt?.storageId) {
      if (templates.length > 0 && selectedPrompt && !selectedPrompt.storageId) {
        console.warn('[DynamicRouter] Template exists but missing storageId:', {
          templateName: selectedPrompt.templateName,
          template: selectedPrompt
        })
      }
      setReviews([])
      setAverageRating(0)
      setReviewCount(0)
      setUserReview(null)
      return
    }
    
      try {
        setLoadingReviews(true)
        const user = getCurrentUser()
        
        console.log('[DynamicRouter] Loading reviews for storageId:', selectedPrompt.storageId)
        
        const [feedbacksData, avgRating, count] = await Promise.all([
          feedbackService.getFeedbackByStorageId(selectedPrompt.storageId).catch((e: any) => {
            if (e?.response?.status === 404) {
              console.log('[DynamicRouter] No feedbacks found for storageId:', selectedPrompt.storageId)
              return []
            }
            throw e
          }),
          feedbackService.getAverageRatingByStorageId(selectedPrompt.storageId).catch((e: any) => {
            if (e?.response?.status === 404) return 0
            console.warn('[DynamicRouter] Failed to get average rating:', e)
            return 0
          }),
          feedbackService.getFeedbackCountByStorageId(selectedPrompt.storageId).catch((e: any) => {
            if (e?.response?.status === 404) return 0
            console.warn('[DynamicRouter] Failed to get feedback count:', e)
            return 0
          }),
        ])
        
        console.log('[DynamicRouter] Raw feedbacks data from API:', {
          feedbacksData,
          feedbacksDataType: typeof feedbacksData,
          isArray: Array.isArray(feedbacksData),
          feedbacksCount: Array.isArray(feedbacksData) ? feedbacksData.length : 0,
          avgRating,
          count,
        })
        
        // Convert Feedback[] to Review[]
        let reviewList: Review[] = Array.isArray(feedbacksData) 
          ? feedbacksData.map(feedbackToReview)
          : []
        let userReviewData: Review | null = null
        
        // Find user's review from the list
        if (user?.userId) {
          try {
            console.log('[DynamicRouter] Looking for user feedback for userId:', user.userId, 'storageId:', selectedPrompt.storageId)
            const userFeedback = feedbacksData.find((f: Feedback) => f.userId === user.userId)
            if (userFeedback) {
              userReviewData = feedbackToReview(userFeedback)
              console.log('[DynamicRouter] Found user feedback:', userReviewData)
              // Check if user review is already in the list
              const existingIndex = reviewList.findIndex(r => r.reviewId === userReviewData!.reviewId)
              if (existingIndex >= 0) {
                // Update existing review with user review data
                reviewList[existingIndex] = userReviewData
              } else {
                // Add user review to the beginning of the list
                reviewList = [userReviewData, ...reviewList]
                console.log('[DynamicRouter] Added user review to list. New length:', reviewList.length)
              }
            } else {
              console.log('[DynamicRouter] User review is null from API, checking localStorage...')
              // Try to load from localStorage as fallback
              const reviewKey = `review_${selectedPrompt.storageId}_${user.userId}`
              try {
                const savedReviewStr = localStorage.getItem(reviewKey)
                if (savedReviewStr) {
                  const savedReview = JSON.parse(savedReviewStr)
                  // Check if saved review is recent (within last 24 hours)
                  const savedAt = savedReview.savedAt ? new Date(savedReview.savedAt) : null
                  const isRecent = savedAt && (Date.now() - savedAt.getTime()) < 24 * 60 * 60 * 1000
                  
                  if (isRecent) {
                    console.log('[DynamicRouter] Found saved review in localStorage:', savedReview)
                    // Remove savedAt before using
                    const { savedAt: _, ...reviewWithoutSavedAt } = savedReview
                    userReviewData = reviewWithoutSavedAt as Review
                    
                    // Check if already in list
                    const existingIndex = reviewList.findIndex(r => r.reviewId === userReviewData!.reviewId)
                    if (existingIndex >= 0) {
                      reviewList[existingIndex] = userReviewData
                    } else {
                      reviewList = [userReviewData, ...reviewList]
                      console.log('[DynamicRouter] Added saved review from localStorage to list')
                    }
                  } else {
                    // Remove old saved review
                    localStorage.removeItem(reviewKey)
                    console.log('[DynamicRouter] Removed old saved review from localStorage')
                  }
                }
              } catch (localErr) {
                console.warn('[DynamicRouter] Failed to load review from localStorage:', localErr)
          }
        }
      } catch (e: any) {
            console.log('[DynamicRouter] User has not reviewed yet or error:', e?.response?.status || e?.message)
            // If 404, try localStorage as fallback
            if (e?.response?.status === 404) {
              const reviewKey = `review_${selectedPrompt.storageId}_${user.userId}`
              try {
                const savedReviewStr = localStorage.getItem(reviewKey)
                if (savedReviewStr) {
                  const savedReview = JSON.parse(savedReviewStr)
                  const savedAt = savedReview.savedAt ? new Date(savedReview.savedAt) : null
                  const isRecent = savedAt && (Date.now() - savedAt.getTime()) < 24 * 60 * 60 * 1000
                  
                  if (isRecent) {
                    console.log('[DynamicRouter] Using saved review from localStorage (404 from API):', savedReview)
                    const { savedAt: _, ...reviewWithoutSavedAt } = savedReview
                    userReviewData = reviewWithoutSavedAt as Review
                    
                    const existingIndex = reviewList.findIndex(r => r.reviewId === userReviewData!.reviewId)
                    if (existingIndex >= 0) {
                      reviewList[existingIndex] = userReviewData
                    } else {
                      reviewList = [userReviewData, ...reviewList]
                    }
                  }
                }
              } catch (localErr) {
                // ignore
              }
            } else {
              console.warn('[DynamicRouter] Unexpected error loading user review:', e)
            }
            if (!userReviewData) {
              userReviewData = null
            }
          }
        }
        
        console.log('[DynamicRouter] Final review list after merging user review:', {
          totalReviews: reviewList.length,
          reviewIds: reviewList.map(r => r.reviewId),
          hasUserReview: !!userReviewData
        })
        
        if ((!reviewList || reviewList.length === 0) && options?.fallbackReview) {
          console.log('[DynamicRouter] Using fallback review because server returned empty list')
          reviewList = [options.fallbackReview]
          userReviewData = options.fallbackReview
        }
        
        // Build or update users map for displaying full names
        const newUsersMap = new Map(usersMap)
        const missingUserIds = reviewList
          .map(r => r.user?.userId || r.userId)
          .filter((id): id is number => Boolean(id) && !newUsersMap.has(id))

        if (missingUserIds.length > 0) {
          try {
            const fetchedUsers = await Promise.all(
              missingUserIds.map(async (id) => {
                try {
                  return await userService.getUserById(id)
                } catch (fetchErr) {
                  console.warn('[DynamicRouter] Could not fetch user info for', id, fetchErr)
                  return null
                }
              })
            )
            fetchedUsers.forEach((u) => {
              if (u && (u.userId || (u as any).id)) {
                newUsersMap.set(u.userId || (u as any).id, u)
              }
            })
          } catch (mapErr) {
            console.warn('[DynamicRouter] Failed to build users map:', mapErr)
          }
        }
        
        // Merge user details into reviewList
        reviewList = reviewList.map((review) => {
          const userDetails = review.user || newUsersMap.get(review.userId) || null
          if (userDetails) {
            return {
              ...review,
              user: {
                userId: userDetails.userId || review.userId,
                fullName: userDetails.fullName || userDetails.name || review.user?.fullName,
                email: userDetails.email || review.user?.email,
                avatar: (userDetails as any)?.avatar || review.user?.avatar,
              },
            }
          }
          return review
        })

        if (newUsersMap.size !== usersMap.size) {
          setUsersMap(newUsersMap)
        }
        
        setReviews(reviewList)
        setUserReview(userReviewData)
        
        const avgRatingValue = typeof avgRating === 'number' ? avgRating : (typeof avgRating === 'object' && avgRating !== null && 'rating' in avgRating ? Number((avgRating as any).rating) : 0)
        setAverageRating(avgRatingValue)
        
        // Always use actual review list length, not API count
        setReviewCount(reviewList.length)
      } catch (e: any) {
        console.error('[DynamicRouter] Failed to load reviews:', e)
        console.error('[DynamicRouter] Error details:', e?.response?.data)
      } finally {
        setLoadingReviews(false)
      }
    },
    [selectedPrompt?.storageId, loading, templates.length, usersMap]
  )

  // Load reviews when selected template changes - DISABLED (reviews section removed)
  // useEffect(() => {
  //   loadReviews()
  // }, [loadReviews])

  // Keep reviewCount in sync with actual reviews array length - DISABLED (reviews section removed)
  // useEffect(() => {
  //   setReviewCount(reviews.length)
  // }, [reviews.length])

// Track view count per template (client-side)
useEffect(() => {
  if (!selectedPrompt?.storageId) return
  try {
    const viewKey = `template_view_count_${selectedPrompt.storageId}`
    const stored = localStorage.getItem(viewKey)
    const currentCount = stored ? Math.max(0, Number(stored)) : 0
    const newCount = currentCount + 1
    localStorage.setItem(viewKey, newCount.toString())
    setViewCount(newCount)
    console.log('[DynamicRouter] View count updated:', { storageId: selectedPrompt.storageId, newCount })
  } catch (e) {
    console.warn('[DynamicRouter] Could not update view count:', e)
    setViewCount(prev => (prev === 0 ? 1 : prev))
  }
}, [selectedPrompt?.storageId])

// Update favorite count based on user state
useEffect(() => {
  if (!selectedPrompt?.storageId) return
  setFavoriteCount(isFavorite ? 1 : 0)
}, [isFavorite, selectedPrompt?.storageId])

  // DISABLED - reviews section removed
  /*
  const handleCreateReview = async () => {
    if (!currentUser?.userId) {
      showToast('Vui lòng đăng nhập để đánh giá', 'warning')
      return
    }
    
    if (!selectedPrompt?.storageId) {
      showToast('Không tìm thấy template', 'error')
      return
    }
    
    const trimmedComment = reviewForm.comment.trim()
    if (!trimmedComment) {
      showToast('Vui lòng nhập nội dung đánh giá', 'warning')
      return
    }
    if (trimmedComment.length > MAX_REVIEW_COMMENT_LENGTH) {
      showToast(`Nội dung đánh giá tối đa ${MAX_REVIEW_COMMENT_LENGTH} ký tự`, 'warning')
      return
    }
    
    // Validate và chuẩn bị request payload (trước try để có thể dùng trong catch)
    const storageId = selectedPrompt.storageId
    if (!storageId || storageId <= 0) {
      showToast('StorageId không hợp lệ', 'error')
      return
    }

    // Chỉ gửi packageId nếu nó có giá trị hợp lệ (> 0)
    let packageId: number | undefined = undefined
    const rawPackageId = (selectedPrompt as any)?.packageId
    if (rawPackageId !== null && rawPackageId !== undefined) {
      const numPackageId = typeof rawPackageId === 'number' ? rawPackageId : Number(rawPackageId)
      if (Number.isFinite(numPackageId) && numPackageId > 0) {
        packageId = numPackageId
      }
    }

    const feedbackRequest: any = {
      storageId: storageId,
      rating: reviewForm.rating,
      comment: trimmedComment,
    }

    // Chỉ thêm packageId nếu có giá trị hợp lệ
    if (packageId) {
      feedbackRequest.packageId = packageId
    }

    // Store request for error handling
    const requestPayload = { ...feedbackRequest }
    
    try {
      setIsSubmittingReview(true)
      console.log('[DynamicRouter] Creating review with:', {
        storageId: selectedPrompt.storageId,
        rating: reviewForm.rating,
        comment: trimmedComment
      })
      
      console.log('[DynamicRouter] Feedback request payload:', feedbackRequest)
      
      const newFeedback = await feedbackService.createFeedback(feedbackRequest)
      const newReview = feedbackToReview(newFeedback)
      
      console.log('[DynamicRouter] Feedback created successfully:', newReview)
      
      // Save review to localStorage as backup (in case server doesn't return it on reload)
      const reviewKey = `review_${selectedPrompt.storageId}_${currentUser.userId}`
      const reviewToSave = {
        ...newReview,
        user: currentUser
          ? {
              userId: Number(currentUser.userId) || newReview.userId,
              fullName: currentUser.fullName,
              email: currentUser.email,
              avatar: currentUser.avatar,
            }
          : newReview.user,
        savedAt: new Date().toISOString(),
      }
      try {
        localStorage.setItem(reviewKey, JSON.stringify(reviewToSave))
        console.log('[DynamicRouter] Saved review to localStorage:', reviewKey)
      } catch (e) {
        console.warn('[DynamicRouter] Failed to save review to localStorage:', e)
      }
      
      // Reset form
      setReviewForm({ rating: 5, comment: '' })
      setShowReviewForm(false)
      
      const fallbackReview = reviewToSave
      
      // DISABLED - reviews section removed
      // Reload all reviews from server to ensure consistency
      // await loadReviews({ fallbackReview })
      
      showToast('Đánh giá thành công', 'success')
    } catch (e: any) {
      console.error('[DynamicRouter] Failed to create review:', e)
      console.error('[DynamicRouter] Error response:', e?.response?.data)
      
      // Xử lý các loại lỗi khác nhau
      let errorMessage = 'Không thể tạo đánh giá'
      const errorData = e?.response?.data
      
      if (errorData?.errors) {
        const flatErrors = Object.values(errorData.errors)
          .flat()
          .filter(Boolean) as string[]
        if (flatErrors.length > 0) {
          errorMessage = flatErrors.join(' ')
        }
      }

      // Xử lý theo status code trước
      const statusCode = e?.response?.status
      
      if (statusCode === 401) {
        // User not found hoặc unauthorized
        errorMessage = 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
      } else if (statusCode === 404) {
        // Not found errors
        if (errorData?.message) {
          const msg = errorData.message.toLowerCase()
          if (msg.includes('storagetemplate') && msg.includes('not found')) {
            errorMessage = `Không tìm thấy template với ID ${requestPayload.storageId}. Vui lòng làm mới trang và thử lại.`
          } else if (msg.includes('package') && msg.includes('not found')) {
            errorMessage = `Không tìm thấy gói (package) với ID ${requestPayload.packageId}. Vui lòng liên hệ admin.`
          } else if (msg.includes('storage') && msg.includes('not found')) {
            errorMessage = `Không tìm thấy template với ID ${requestPayload.storageId}. Vui lòng làm mới trang và thử lại.`
          } else {
            errorMessage = errorData.message || 'Không tìm thấy tài nguyên. Vui lòng làm mới trang và thử lại.'
          }
        } else {
          errorMessage = 'Không tìm thấy tài nguyên. Vui lòng làm mới trang và thử lại.'
        }
      } else if (statusCode === 400) {
        // Bad request errors
        if (errorData?.message) {
          const msg = errorData.message.toLowerCase()
          if (msg.includes('already reviewed') || msg.includes('already submitted') || msg.includes('duplicate')) {
            errorMessage = 'Bạn đã đánh giá template này rồi. Bạn có thể chỉnh sửa đánh giá hiện tại.'
            // DISABLED - reviews section removed
            // Reload reviews để lấy userReview mới nhất, sau đó tự động chuyển sang chế độ chỉnh sửa
            // loadReviews().then(() => {
            //   // Sau khi reload, userReview sẽ được set trong loadReviews
            //   // Sử dụng setTimeout để đợi state update
            //   setTimeout(() => {
            //     // Lấy userReview từ state hiện tại (sẽ được update sau khi loadReviews hoàn thành)
            //     const currentUserReview = reviews.find((r: Review) => r.userId === currentUser?.userId)
            //     if (currentUserReview) {
            //       setEditingReviewId(currentUserReview.reviewId)
            //       setReviewForm({ rating: currentUserReview.rating, comment: currentUserReview.comment })
            //       setShowReviewForm(true)
            //       console.log('[DynamicRouter] Auto-switched to edit mode for duplicate review')
            //     }
            //   }, 300)
            // }).catch((reloadErr) => {
            //   console.warn('[DynamicRouter] Could not reload reviews after duplicate error:', reloadErr)
            // })
          } else if (msg.includes('rating must be between') || msg.includes('rating')) {
            errorMessage = 'Đánh giá phải từ 1 đến 5 sao.'
          } else if (msg.includes('comment cannot exceed') || msg.includes('comment')) {
            errorMessage = 'Bình luận không được vượt quá 5000 ký tự.'
          } else {
            errorMessage = errorData.message
          }
        } else {
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.'
        }
      } else if (errorData?.message) {
        // Xử lý các error messages khác (legacy support)
        const msg = errorData.message.toLowerCase()
        if (msg.includes('sequence contains no elements')) {
          errorMessage = 'Không tìm thấy thông tin template hoặc package. Vui lòng thử lại sau.'
        } else if (msg.includes('feedback with id') && msg.includes('could not be loaded')) {
          // Backend đã fix, nhưng vẫn giữ để tương thích
          errorMessage = 'Lỗi hệ thống khi tải feedback. Vui lòng làm mới trang (F5) và thử lại.'
        } else if (msg.includes('user not found')) {
          errorMessage = 'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.'
        } else {
          errorMessage = errorData.message
        }
      } else if (e?.message) {
        errorMessage = e.message
      }
      
      // Log chi tiết để debug
      console.error('[DynamicRouter] Feedback creation error details:', {
        error: e,
        response: e?.response,
        status: e?.response?.status,
        data: e?.response?.data,
        request: requestPayload
      })
      
      showToast(errorMessage, 'error')
    } finally {
      setIsSubmittingReview(false)
    }
  }
  */

  // DISABLED - reviews section removed
  /*
  const handleUpdateReview = async (reviewId: number) => {
    const trimmedComment = reviewForm.comment.trim()
    if (!trimmedComment) {
      showToast('Vui lòng nhập nội dung đánh giá', 'warning')
      return
    }
    if (trimmedComment.length > MAX_REVIEW_COMMENT_LENGTH) {
      showToast(`Nội dung đánh giá tối đa ${MAX_REVIEW_COMMENT_LENGTH} ký tự`, 'warning')
      return
    }
    
    try {
      setIsSubmittingReview(true)
      console.log('[DynamicRouter] Updating feedback:', reviewId)
      
      // reviewId is actually feedbackId in our mapping
      const updatedFeedback = await feedbackService.updateFeedback(reviewId, {
        rating: reviewForm.rating,
        comment: trimmedComment, // Backend expects 'comment'
      })
      const updated = feedbackToReview(updatedFeedback)
      
      console.log('[DynamicRouter] Feedback updated successfully:', updated)
      
      // Update localStorage
      if (currentUser?.userId && selectedPrompt?.storageId) {
        const reviewKey = `review_${selectedPrompt.storageId}_${currentUser.userId}`
        const reviewToSave = {
          ...updated,
          user: currentUser
            ? {
                userId: Number(currentUser.userId) || updated.userId,
                fullName: currentUser.fullName,
                email: currentUser.email,
                avatar: currentUser.avatar,
              }
            : updated.user,
          savedAt: new Date().toISOString(),
        }
        try {
          localStorage.setItem(reviewKey, JSON.stringify(reviewToSave))
          console.log('[DynamicRouter] Updated review in localStorage:', reviewKey)
        } catch (e) {
          console.warn('[DynamicRouter] Failed to update review in localStorage:', e)
        }
      }
      
      setEditingReviewId(null)
      setReviewForm({ rating: 5, comment: '' })
      
      const fallbackReview = {
        ...updated,
        user: currentUser
          ? {
              userId: Number(currentUser.userId) || updated.userId,
              fullName: currentUser.fullName,
              email: currentUser.email,
              avatar: currentUser.avatar,
            }
          : updated.user,
      }
      
      // DISABLED - reviews section removed
      // Reload all reviews from server to ensure consistency
      // await loadReviews({ fallbackReview })
      
      showToast('Cập nhật đánh giá thành công', 'success')
    } catch (e: any) {
      console.error('[DynamicRouter] Failed to update review:', e)
      console.error('[DynamicRouter] Error response:', e?.response?.data)

      const errorData = e?.response?.data
      let errorMessage = errorData?.message || 'Không thể cập nhật đánh giá'

      if (errorData?.errors) {
        const flatErrors = Object.values(errorData.errors)
          .flat()
          .filter(Boolean) as string[]
        if (flatErrors.length > 0) {
          errorMessage = flatErrors.join(' ')
        }
      }

      if (errorData?.message) {
        if (errorData.message.toLowerCase().includes('storage') && errorData.message.toLowerCase().includes('not found')) {
          errorMessage = 'Không tìm thấy thông tin template. Vui lòng làm mới trang và thử lại.'
        } else if (errorData.message.toLowerCase().includes('package') && errorData.message.toLowerCase().includes('not found')) {
          errorMessage = 'Không tìm thấy thông tin gói (package). Vui lòng liên hệ admin.'
        }
      }

      showToast(errorMessage, 'error')
    } finally {
      setIsSubmittingReview(false)
    }
  }
  */

  // DISABLED - reviews section removed
  /*
  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return
    
    try {
      console.log('[DynamicRouter] Deleting feedback:', reviewId)
      // reviewId is actually feedbackId in our mapping
      await feedbackService.deleteFeedback(reviewId)
      console.log('[DynamicRouter] Feedback deleted successfully')
      
      // Remove from localStorage if exists
      if (currentUser?.userId && selectedPrompt?.storageId) {
        const reviewKey = `review_${selectedPrompt.storageId}_${currentUser.userId}`
        try {
          localStorage.removeItem(reviewKey)
          console.log('[DynamicRouter] Removed review from localStorage:', reviewKey)
        } catch (e) {
          console.warn('[DynamicRouter] Failed to remove review from localStorage:', e)
        }
      }
      
      // DISABLED - reviews section removed
      // Reload all reviews from server to ensure consistency
      // await loadReviews()
      
      showToast('Xóa đánh giá thành công', 'success')
    } catch (e: any) {
      console.error('[DynamicRouter] Failed to delete review:', e)
      console.error('[DynamicRouter] Error response:', e?.response?.data)
      showToast(e?.response?.data?.message || 'Không thể xóa đánh giá', 'error')
    }
  }
  */

  // DISABLED - reviews section removed
  /*
  const startEditReview = (review: Review) => {
    setEditingReviewId(review.reviewId)
    setReviewForm({ rating: review.rating, comment: review.comment })
    setShowReviewForm(true)
  }

  const cancelEditReview = () => {
    setEditingReviewId(null)
    setShowReviewForm(false)
    setReviewForm({ rating: 5, comment: '' })
  }

  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`${sizeClass} ${i < rating ? 'text-yellow-400' : 'text-gray-400'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  const getTimeAgo = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    if (years > 0) return `${years} năm trước`
    if (months > 0) return `${months} tháng trước`
    if (days > 0) return `${days} ngày trước`
    if (hours > 0) return `${hours} giờ trước`
    if (minutes > 0) return `${minutes} phút trước`
    return 'vừa xong'
  }
  */

  // DISABLED - reviews section removed
  // const getUserInitial = (name?: string, email?: string) => {
  const _getUserInitial = (name?: string, email?: string) => {
    const displayName = name || email || 'U'
    return displayName.charAt(0).toUpperCase()
  }

  // Validate params - but don't redirect immediately, show error instead
  if (!grade || !subject || !chapter) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">⚠️ Thiếu thông tin route</div>
          <p className="text-neutral-400">Vui lòng cung cấp đầy đủ: grade, subject, chapter</p>
        </div>
      </div>
    )
  }

  // Validate grade
  if (!['10', '11', '12'].includes(grade)) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">⚠️ Khối không hợp lệ</div>
          <p className="text-neutral-400">Khối phải là 10, 11, hoặc 12</p>
        </div>
      </div>
    )
  }

  // Validate subject - but be more lenient (case-insensitive, allow variations)
  const subjectKey = subject.toLowerCase()
  const isValidSubject = Object.keys(subjectDisplayMap).some(key => 
    key.toLowerCase() === subjectKey || 
    subjectDisplayMap[key].toLowerCase() === subjectKey ||
    subjectKey.includes(key.toLowerCase()) ||
    key.toLowerCase().includes(subjectKey)
  )
  
  if (!isValidSubject) {
    console.warn('[DynamicRouter] Subject not in map:', subject, 'Available:', Object.keys(subjectDisplayMap))
    // Don't redirect, just show warning and continue - might still find templates
  }

  // Fallback display values
  const defaultImage = new URL('../../assets/Image/Toan10.png', import.meta.url).href
  
  const handleLibrary = async () => {
    if (libraryProcessing) return

    if (!currentUser?.userId) {
      showToast('Vui lòng đăng nhập để sử dụng tính năng này', 'warning')
      navigate('/login')
      return
    }

    if (!selectedPrompt) {
      showToast('Không tìm thấy thông tin prompt', 'error')
      return
    }

    if (!selectedPackageId) {
      console.warn('[DynamicRouter] No packageId found for template:', selectedPrompt)
      showToast('Prompt này chưa có packageId, không thể thêm vào kho', 'warning')
      return
    }

    if (isInLibrary) {
    navigate('/mystorage')
      return
    }

    try {
      setLibraryProcessing(true)
      await storageTemplateService.saveTemplate({
        packageId: selectedPackageId,
        templateName: selectedPrompt.templateName,
        templateContent: selectedPrompt.templateContent,
        grade: selectedPrompt.grade,
        subject: selectedPrompt.subject,
        chapter: selectedPrompt.chapter,
        isPublic: false,
      })
      setIsInLibrary(true)
      showToast('Đã thêm vào Kho Prompt', 'success')
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('storageUpdated'))
    } catch (err: any) {
      const message = err?.response?.data?.message
      if (message && /đã tồn tại|already/i.test(message)) {
        setIsInLibrary(true)
        showToast('Prompt đã có trong Kho Prompt', 'info')
      } else {
        showToast(message || 'Không thể thêm vào Kho Prompt', 'error')
      }
    } finally {
      setLibraryProcessing(false)
    }
  }
  
  const handleToggleFavorite = async () => {
    if (favoriteProcessing) return

    if (!currentUser?.userId) {
      showToast('Vui lòng đăng nhập để sử dụng tính năng này', 'warning')
      navigate('/login')
      return
    }

    console.log('[DynamicRouter] handleToggleFavorite - selectedPrompt:', selectedPrompt)
    console.log('[DynamicRouter] handleToggleFavorite - selectedStorageId:', selectedStorageId)

    if (!selectedStorageId) {
      console.warn('[DynamicRouter] No storageId available. selectedPrompt:', selectedPrompt)
      showToast('Prompt này không có storageId, không thể thêm vào yêu thích', 'warning')
      return
    }

    if (isFavorite) {
      navigate('/myfavorites')
      return
    }

    try {
      setFavoriteProcessing(true)
      console.log('[DynamicRouter] Adding to wishlist:')
      console.log('  - selectedPrompt:', selectedPrompt)
      console.log('  - selectedStorageId:', selectedStorageId)
      console.log('  - selectedPackageId:', selectedPackageId)
      
      // Validate storageId
      if (!selectedStorageId || selectedStorageId <= 0) {
        throw new Error('StorageId không hợp lệ')
      }
      
      const requestPayload = { 
        storageId: selectedStorageId,
        ...(selectedPackageId && selectedPackageId > 0 ? { packageId: selectedPackageId } : {})
      }
      
      console.log('[DynamicRouter] Request payload:', requestPayload)
      
      const result = await wishlistService.addToWishlist(requestPayload)
      console.log('[DynamicRouter] Wishlist add result:', result)
      setIsFavorite(true)
      showToast('Đã thêm vào Prompt yêu thích', 'success')
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('wishlistUpdated'))
    } catch (err: any) {
      console.error('[DynamicRouter] Failed to add to wishlist:', err)
      console.error('[DynamicRouter] Error response:', err?.response?.data)
      console.error('[DynamicRouter] Error status:', err?.response?.status)
      
      const message = err?.response?.data?.message || err?.message
      const statusCode = err?.response?.status
      
      if (message && /đã tồn tại|already/i.test(message)) {
        setIsFavorite(true)
        showToast('Prompt đã có trong Prompt yêu thích', 'info')
        window.dispatchEvent(new CustomEvent('wishlistUpdated'))
      } else if (statusCode === 500) {
        // Backend error - show detailed error
        const errorDetail = err?.response?.data?.message || 'Lỗi server. Vui lòng thử lại sau.'
        console.error('[DynamicRouter] Backend error details:', err?.response?.data)
        showToast(`Lỗi server: ${errorDetail}`, 'error')
      } else {
        showToast(message || 'Không thể thêm vào Prompt yêu thích', 'error')
      }
    } finally {
      setFavoriteProcessing(false)
    }
  }


  const HeaderComponent = getHeaderComponent(grade)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <HeaderComponent />
      <div className="flex">
        <SiderBar />
        <main className="flex-1 bg-[#23233a] text-white min-h-[calc(100vh-4rem)] px-0">
          {/* Header */}
          <div className="bg-[#1a1a2d] border-b border-[#2f2f4a] py-4">
            <div className="max-w-7xl mx-auto px-4">
              <h1 className="text-2xl font-bold text-white">{subjectName} Học Lớp {grade}</h1>
              <p className="text-neutral-400 mt-1">Các prompt AI cho môn {subjectName} lớp {grade}</p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Image Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">{chapterText}</h2>
            {loading && (
              <div className="text-neutral-400">Đang tải template...</div>
            )}
            {error && !loading && (
              <div className="text-red-400">{error}</div>
            )}
            {!loading && !error && templates.length === 0 && (
              <div className="text-center py-8">
                <div className="text-yellow-400 mb-4">⚠️ Chưa có template nào cho chương này</div>
                <p className="text-neutral-400 text-sm">
                  Admin cần tạo template trong Dashboard Admin trước.
                  <br />
                  Thông tin: Khối {grade}, Môn {subjectName}, {chapterText}
                </p>
              </div>
            )}
            {!loading && !error && templates.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {templates.map((tpl) => (
                  <div
                    key={tpl.storageId}
                    className="group relative bg-[#23233a] rounded-xl border border-[#2a2a44] hover:border-[#3a3a54] transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer"
                  >
                    <div className="aspect-square relative rounded-xl overflow-hidden">
                      {/* Blurred background image */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm"
                        style={{ backgroundImage: `url(${defaultImage})` }}
                      ></div>
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/50 rounded-xl group-hover:bg-black/30 transition-all duration-300"></div>
                      
                      {/* Text content - not blurred */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center p-4">
                          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                            {tpl.templateName}
                          </h3>
                          <p className="text-xs text-neutral-300 mb-2 line-clamp-3 leading-relaxed">
                            {(tpl.subject || subjectName) + (tpl.chapter ? ` • ${tpl.chapter}` : '')}
                          </p>
                          <div className="flex items-center justify-center space-x-2 text-xs text-neutral-300">
                            <span className="flex items-center">
                              <Download className="w-3 h-3 mr-1" />
                              0
                            </span>
                            <span className="flex items-center">
                              <Heart className="w-3 h-3 mr-1" />
                              {isFavorite ? 1 : 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Content Details */}
          {selectedPrompt && (
            <div className="space-y-6">
              {/* Header with heart icon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-neutral-400">▲ EduPrompt</span>
                  <Heart className="w-4 h-4 text-red-500" />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white">
                  {selectedPrompt.templateName}
                </h1>
              </div>

              {/* Statistics */}
              <div className="flex items-center space-x-6 text-sm text-neutral-300">
                <div className="flex items-center space-x-1">
                  <Heart
                    className={`w-4 h-4 transition-colors fill-current ${
                      isFavorite
                        ? 'text-pink-400 fill-pink-400'
                        : 'text-neutral-400'
                    }`}
                  />
                  <span>
                    {favoriteCount} {favoriteCount === 1 ? 'Favorite' : 'Favorites'}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4 text-neutral-400" />
                  <span>
                    {viewCount} {viewCount === 1 ? 'View' : 'Views'}
                  </span>
                </div>
              </div>

              {/* Creator */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-neutral-400">@eduprompt</span>
                <Heart className="w-3 h-3 text-red-500" />
                <span className="text-sm text-neutral-400">1</span>
              </div>

              {/* Tags/Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-[#2a2a44] rounded text-xs text-neutral-300">0 từ khóa</span>
                <span className="px-2 py-1 bg-[#2a2a44] rounded text-xs text-neutral-300">
                  2.5-FLASH-IMAGE
                </span>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs flex items-center">
                  <Check className="w-3 h-3 mr-1" />
                  Tested
                </span>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs flex items-center">
                  <Check className="w-3 h-3 mr-1" />
                  Instructions
                </span>
              </div>

              {/* Template Content */}
              {selectedPrompt.templateContent && (
                <div className="bg-[#1a1a2d] rounded-lg p-4 border border-[#2a2a44] max-h-96 overflow-y-auto">
                  <h3 className="text-sm font-semibold text-neutral-300 mb-2">Nội dung Prompt:</h3>
                  <div className="text-sm text-neutral-300 whitespace-pre-wrap">
                    {(() => {
                      try {
                        const contentObj = JSON.parse(selectedPrompt.templateContent)
                        return contentObj.content || selectedPrompt.templateContent
                      } catch {
                        return selectedPrompt.templateContent
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* Ownership Status */}
              <div className="space-y-2">
                {packageInfo && (
                  <div className="text-xs text-neutral-400 mb-1">
                    <span className="text-neutral-500">Gói: </span>
                    <span className="text-blue-400 font-medium">{packageInfo.packageName}</span>
                </div>
                )}
                <div
                  className={`text-sm font-medium ${
                    checkingPayment ? 'text-blue-300' : isPaid ? 'text-green-400' : 'text-yellow-400'
                  }`}
                >
                  {checkingPayment
                    ? 'Đang kiểm tra quyền truy cập...'
                    : isPaid
                      ? 'Bạn đã sở hữu gói chứa template này.'
                      : 'Bạn chưa sở hữu gói chứa template này. Vui lòng mua gói phù hợp để sử dụng.'}
                </div>
                {!isPaid && !checkingPayment && (
                  <div className="text-xs text-neutral-400">
                    <button
                      onClick={() => navigate('/packages')}
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      Xem các gói Prompt
                    </button>{' '}
                    để mua và mở khóa tính năng Chat tạo Prompt.
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <Button 
                onClick={handleLibrary} 
                disabled={libraryProcessing}
                className="w-full text-white font-semibold py-3 rounded-lg 
                bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 
                shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 
                transition-all duration-300 ease-out transform hover:-translate-y-0.5 active:translate-y-0 
                focus:outline-none focus:ring-2 focus:ring-sky-400/60">
                {libraryProcessing ? 'Đang thêm...' : isInLibrary ? 'Đi đến kho prompt' : 'Thêm vào Thư viện'}
              </Button>
              
              <Button 
                onClick={() => {
                  // Đảm bảo template có packageId trước khi navigate
                  const templateToPass = selectedPrompt ? {
                    ...selectedPrompt,
                    packageId: templatePackageId || selectedPackageId || selectedPrompt.packageId || 0
                  } : selectedPrompt
                  
                  navigate(`/grade${grade}/${subject}/detail/${chapter}/form`, {
                    state: { template: templateToPass }
                  })
                }}
                disabled={!isPaid || checkingPayment}
                className={`w-full text-white font-semibold py-3 rounded-lg mt-2 ${
                  isPaid 
                    ? 'bg-[#2a2a44] hover:bg-[#3a3a54]' 
                    : 'bg-gray-600 hover:bg-gray-700 opacity-50 cursor-not-allowed'
                }`}
                title={!isPaid ? 'Vui lòng mua gói phù hợp để sử dụng tính năng này' : ''}
              >
                {checkingPayment 
                  ? 'Đang kiểm tra...' 
                  : isPaid 
                    ? `Mở Chat tạo Prompt (${chapterText})` 
                    : 'Mở Chat tạo Prompt (Cần mua gói)'}
              </Button>
              <Button 
                onClick={handleToggleFavorite} 
                aria-pressed={isFavorite} 
                disabled={favoriteProcessing}
                className={`w-full ${isFavorite ? 'bg-pink-600 hover:bg-pink-700' : 'bg-[#2a2a44] hover:bg-[#3a3a54]'} text-white font-semibold py-3 rounded-lg mt-2 flex items-center justify-center`}
              >
                <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'text-red-500' : 'text-white'}`} fill={isFavorite ? 'currentColor' : 'none'} />
                {favoriteProcessing ? 'Đang thêm...' : isFavorite ? 'Đi đến prompt yêu thích' : 'Thêm vào yêu thích'}
              </Button>

              {/* Terms */}
              <p className="text-xs text-neutral-500 leading-relaxed">
                Sau khi tải xuống, bạn sẽ có quyền truy cập vào file prompt mà bạn có thể sử dụng với EduPrompt hoặc trên PromptBase. 
                Bằng cách tải xuống prompt này, bạn đồng ý với các điều khoản dịch vụ của chúng tôi.
              </p>

              {/* Timestamp */}
              <p className="text-xs text-neutral-500">
                Đã thêm {selectedPrompt.createdAt ? new Date(selectedPrompt.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  timeZone: 'Asia/Ho_Chi_Minh'
                }) : 'gần đây'}
              </p>


            </div>
          )}
          
          {!selectedPrompt && !loading && !error && (
            <div className="space-y-6">
              <div className="text-center py-8 text-neutral-400">
                Chưa có template nào được tạo cho chương này.
              </div>
            </div>
          )}
        </div>

          </div>
        </main>
      </div>
    </div>
  )
}

