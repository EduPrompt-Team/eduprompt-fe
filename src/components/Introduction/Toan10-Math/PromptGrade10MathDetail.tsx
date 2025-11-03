import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '../../ui/button'
import { Heart, Download, Eye, Check, Star, Edit2, Trash2, MoreVertical } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { storageTemplateService } from '@/services/storageTemplateService'
import { reviewService } from '@/services/reviewService'
import { getCurrentUser } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import type { StorageTemplate } from '@/services/storageTemplateService'
import type { Review } from '@/services/reviewService'

const PromptGrade10MathDetail: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [templates, setTemplates] = useState<StorageTemplate[]>([])
  
  // Review states
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState<number>(0)
  const [reviewCount, setReviewCount] = useState<number>(0)
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [showMenuId, setShowMenuId] = useState<number | null>(null)
  const [usersMap, setUsersMap] = useState<Map<number, any>>(new Map()) // Map userId -> user info
  
  const handleLibrary = () => {
    navigate('/mystorage')
  }
  const handleToggleFavorite = () => {
    setIsFavorite((prev) => !prev)
  }
  // Load public storage templates for Grade 10 - Math
  useEffect(() => {
    let isMounted = true
    async function load() {
      try {
        setLoading(true)
        const data = await storageTemplateService.getPublicTemplates({ grade: '10', subject: 'Toán' })
        if (!isMounted) return
        const templatesArray = Array.isArray(data) ? data : (data as any)?.data || []
        console.log('[PromptGrade10MathDetail] Loaded templates:', templatesArray)
        console.log('[PromptGrade10MathDetail] Templates count:', templatesArray.length)
        setTemplates(templatesArray)
      } catch (e: any) {
        if (!isMounted) return
        setError(e?.message ?? 'Không tải được danh sách Template')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()
    return () => { isMounted = false }
  }, [])

  // Load current user
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [])

  // Load reviews when selected template changes
  const selectedPrompt = useMemo(() => {
    const prompt = templates[0]
    console.log('[PromptGrade10MathDetail] Selected prompt:', prompt)
    console.log('[PromptGrade10MathDetail] Has storageId?', prompt?.storageId)
    return prompt
  }, [templates])
  
  useEffect(() => {
    // Don't try to load reviews if still loading templates or no templates found
    if (loading) return
    
    if (!selectedPrompt?.storageId) {
      // Only log warning if templates are loaded but no storageId found (not just empty array)
      if (templates.length > 0 && selectedPrompt && !selectedPrompt.storageId) {
        console.warn('[PromptGrade10MathDetail] Template exists but missing storageId:', {
          templateName: selectedPrompt.templateName,
          template: selectedPrompt
        })
      }
      // Reset reviews when no valid template
      setReviews([])
      setAverageRating(0)
      setReviewCount(0)
      setUserReview(null)
      return
    }
    
    console.log('[PromptGrade10MathDetail] Loading reviews for storageId:', selectedPrompt.storageId)
    
    let isMounted = true
    
    async function loadReviews() {
      try {
        setLoadingReviews(true)
        const user = getCurrentUser()
        
        // Load reviews, average rating, count, and users for name mapping
        // Handle 404 gracefully (no reviews yet)
        const [reviewsData, avgRating, count, allUsers] = await Promise.all([
          reviewService.getReviewsByStorageId(selectedPrompt.storageId).catch((e: any) => {
            if (e?.response?.status === 404) {
              console.log('[PromptGrade10MathDetail] No reviews found for storageId:', selectedPrompt.storageId);
              return [];
            }
            throw e;
          }),
          reviewService.getAverageRating(selectedPrompt.storageId).catch((e: any) => {
            if (e?.response?.status === 404) return 0;
            console.warn('[PromptGrade10MathDetail] Failed to get average rating:', e);
            return 0;
          }),
          reviewService.getReviewCount(selectedPrompt.storageId).catch((e: any) => {
            if (e?.response?.status === 404) return 0;
            console.warn('[PromptGrade10MathDetail] Failed to get review count:', e);
            return 0;
          }),
          // Load users to map userId -> user info for displaying names
          (async () => {
            try {
              const { userService } = await import('@/services')
              return await userService.getAllUsers().catch(() => [])
            } catch {
              return []
            }
          })()
        ])
        
        // Build users map for quick lookup
        const usersMapData = new Map<number, any>()
        if (Array.isArray(allUsers)) {
          allUsers.forEach((u: any) => {
            const userId = u.userId || u.id
            if (userId) {
              usersMapData.set(userId, u)
            }
          })
        }
        setUsersMap(usersMapData)
        
        if (!isMounted) return
        
        setReviews(Array.isArray(reviewsData) ? reviewsData : [])
        // Ensure values are numbers, not objects (backend may return {rating: 4.5} or {count: 5})
        const avgRatingValue = typeof avgRating === 'number' ? avgRating : (typeof avgRating === 'object' && avgRating !== null && 'rating' in avgRating ? Number((avgRating as any).rating) : 0)
        const countValue = typeof count === 'number' ? count : (typeof count === 'object' && count !== null && 'count' in count ? Number((count as any).count) : 0)
        setAverageRating(avgRatingValue)
        setReviewCount(countValue)
        
        // Load user's review if logged in
        if (user?.userId) {
          try {
            const userRev = await reviewService.getUserReviewForStorage(user.userId, selectedPrompt.storageId)
            if (userRev && isMounted) {
              setUserReview(userRev)
            }
          } catch (e) {
            // User hasn't reviewed yet
            setUserReview(null)
          }
        }
      } catch (e: any) {
        if (!isMounted) return
        console.error('Failed to load reviews:', e)
      } finally {
        if (isMounted) setLoadingReviews(false)
      }
    }
    
    loadReviews()
    return () => { isMounted = false }
  }, [selectedPrompt?.storageId, loading])

  const handleCreateReview = async () => {
    if (!currentUser?.userId) {
      showToast('Vui lòng đăng nhập để đánh giá', 'warning')
      return
    }
    
    if (!selectedPrompt?.storageId) {
      showToast('Không tìm thấy template', 'error')
      return
    }
    
    if (!reviewForm.comment.trim()) {
      showToast('Vui lòng nhập nội dung đánh giá', 'warning')
      return
    }
    
    try {
      setIsSubmittingReview(true)
      const newReview = await reviewService.createReview({
        storageId: selectedPrompt.storageId,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      })
      
      setReviews(prev => [newReview, ...prev])
      setUserReview(newReview)
      setReviewCount(prev => prev + 1)
      setReviewForm({ rating: 5, comment: '' })
      setShowReviewForm(false)
      
      // Recalculate average rating
      const newAvg = await reviewService.getAverageRating(selectedPrompt.storageId).catch(() => averageRating)
      setAverageRating(newAvg || 0)
      
      showToast('Đánh giá thành công', 'success')
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Không thể tạo đánh giá', 'error')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleUpdateReview = async (reviewId: number) => {
    if (!reviewForm.comment.trim()) {
      showToast('Vui lòng nhập nội dung đánh giá', 'warning')
      return
    }
    
    try {
      setIsSubmittingReview(true)
      const updated = await reviewService.updateReview(reviewId, {
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      })
      
      setReviews(prev => prev.map(r => r.reviewId === reviewId ? updated : r))
      setUserReview(updated)
      setEditingReviewId(null)
      setReviewForm({ rating: 5, comment: '' })
      
      // Recalculate average rating
      const newAvg = await reviewService.getAverageRating(selectedPrompt.storageId).catch(() => averageRating)
      setAverageRating(newAvg || 0)
      
      showToast('Cập nhật đánh giá thành công', 'success')
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Không thể cập nhật đánh giá', 'error')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return
    
    try {
      await reviewService.deleteReview(reviewId)
      setReviews(prev => prev.filter(r => r.reviewId !== reviewId))
      setUserReview(null)
      setReviewCount(prev => Math.max(0, prev - 1))
      
      // Recalculate average rating
      if (selectedPrompt?.storageId) {
        const newAvg = await reviewService.getAverageRating(selectedPrompt.storageId).catch(() => 0)
        setAverageRating(newAvg || 0)
      }
      
      showToast('Xóa đánh giá thành công', 'success')
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Không thể xóa đánh giá', 'error')
    }
  }

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

  // Fallback display values
  const defaultImage = new URL('../../assets/Image/Toan10.png', import.meta.url).href
  
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
  
  const getUserInitial = (name?: string, email?: string) => {
    const displayName = name || email || 'U'
    return displayName.charAt(0).toUpperCase()
  }

  // Format time ago (YouTube style)
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

  const handleOpenChapter = (tpl: StorageTemplate) => {
    // Extract chapter number from chapter string (e.g., "Chương 1" -> 1)
    const chapterMatch = (tpl.chapter || '').toString().match(/(\d+)/)
    const chapterNum = chapterMatch ? parseInt(chapterMatch[1], 10) : 1
    
    // Build dynamic route based on template's grade, subject, and chapter
    const grade = tpl.grade || '10'
    const subjectKeyMap: Record<string, string> = {
      'Toán': 'math',
      'Vật lý': 'physics',
      'Hóa học': 'chemistry',
      'Sinh học': 'biology',
      'Ngữ văn': 'literature',
      'Lịch sử': 'history',
      'Địa lý': 'geography',
      'Tiếng Anh': 'english',
      'Tin học': 'informatics',
      'Công nghệ': 'technology',
    }
    const subjectKey = tpl.subject ? (subjectKeyMap[tpl.subject] || tpl.subject.toLowerCase()) : 'math'
    
    // Navigate to dynamic route: /grade{grade}/{subjectKey}/detail/chuong{chapterNum}
    navigate(`/grade${grade}/${subjectKey}/detail/chuong${chapterNum}`)
  }
  const handleOpenChat = () => {
    navigate('/grade10/math/detail/chuong1/chat')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="bg-[#1a1a2d] border-b border-[#2f2f4a] py-4">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-white">Toán Học Lớp 10</h1>
          <p className="text-neutral-400 mt-1">Các prompt AI cho môn Toán lớp 10</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Image Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Học Kỳ 1 - Chương 1</h2>
            <div className="grid grid-cols-2 gap-4">
              {loading && (
                <div className="text-neutral-400">Đang tải template...</div>
              )}
              {error && !loading && (
                <div className="text-red-400">{error}</div>
              )}
              {!loading && !error && templates.map((tpl) => (
                <div
                  key={tpl.storageId}
                  onClick={() => handleOpenChapter(tpl)}
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
                          {(tpl.subject || 'Toán') + (tpl.chapter ? ` • ${tpl.chapter}` : '')}
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
          </div>

          {/* Right Side - Content Details */}
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
                Mệnh Đề và Tập Hợp
              </h1>
            </div>

            {/* Statistics */}
            <div className="flex items-center space-x-6 text-sm text-neutral-300">
              <div className="flex items-center space-x-1">
                <Download className="w-4 h-4" />
                <span>0 Downloads</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>0 Favorites</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>0 Views</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span>{reviewCount} Đánh giá</span>
                {averageRating > 0 && (
                  <span className="ml-1 text-yellow-400">({averageRating.toFixed(1)})</span>
                )}
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
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs flex items-center">
                <Check className="w-3 h-3 mr-1" />
                9 examples
              </span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs flex items-center">
                <Check className="w-3 h-3 mr-1" />
                HD images
              </span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs flex items-center">
                <Check className="w-3 h-3 mr-1" />
                No artists
              </span>
            </div>


            {/* Pricing */}
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-400">
                {selectedPrompt?.templateContent ? (() => {
                  try {
                    const parsed = JSON.parse(selectedPrompt.templateContent)
                    const price = parsed.price || 0
                    return price > 0 ? `${price.toLocaleString('vi-VN')} VNĐ` : 'Miễn phí'
                  } catch {
                    return '500.000 VNĐ'
                  }
                })() : '500.000 VNĐ'}
              </div>
              <button className="text-blue-400 hover:text-blue-300 text-sm">
                Tôi nhận được gì khi tải xuống prompt?
              </button>
            </div>

            {/* Action Button */}
            <Button 
              onClick={handleLibrary} 
              className="w-full text-white font-semibold py-3 rounded-lg 
              bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 
              shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 
              transition-all duration-300 ease-out transform hover:-translate-y-0.5 active:translate-y-0 
              focus:outline-none focus:ring-2 focus:ring-sky-400/60">
              Thêm vào Thư viện
            </Button>
            <Button 
              onClick={handleOpenChat}
              className="w-full bg-[#2a2a44] hover:bg-[#3a3a54] text-white font-semibold py-3 rounded-lg mt-2"
            >
              Mở Chat tạo Prompt (Chương 1)
            </Button>
            <Button 
              onClick={handleToggleFavorite} 
              aria-pressed={isFavorite} 
              className={`w-full ${isFavorite ? 'bg-pink-600 hover:bg-pink-700' : 'bg-[#2a2a44] hover:bg-[#3a3a54]'} text-white font-semibold py-3 rounded-lg mt-2 flex items-center justify-center`}
            >
              <Heart className="w-4 h-4 mr-2 text-white" fill={isFavorite ? 'currentColor' : 'none'} />
              Thêm vào yêu thích
            </Button>

            {/* Terms */}
            <p className="text-xs text-neutral-500 leading-relaxed">
              Sau khi tải xuống, bạn sẽ có quyền truy cập vào file prompt mà bạn có thể sử dụng với EduPrompt hoặc trên PromptBase. 
              Bằng cách tải xuống prompt này, bạn đồng ý với các điều khoản dịch vụ của chúng tôi.
            </p>

            {/* Timestamp */}
            <p className="text-xs text-neutral-500">
              Đã thêm 4 giờ trước
            </p>

            {/* Related App */}
            <div className="bg-[#23233a] rounded-lg p-4 border border-[#2a2a44]">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 bg-cover bg-center rounded"
                  style={{ backgroundImage: `url(${defaultImage})` }}
                ></div>
                <div>
                  <h3 className="font-semibold text-sm">{selectedPrompt?.templateName || 'Template'} Generator</h3>
                  <p className="text-xs text-neutral-400">Ứng dụng liên quan</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Reviews Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {reviewCount} đánh giá
                  </h2>
                  <div className="flex items-center space-x-2 mt-1">
                    {renderStars(Math.round(averageRating))}
                    <span className="text-lg font-semibold text-white">
                      {averageRating > 0 ? averageRating.toFixed(1) : 'Chưa có đánh giá'}
                    </span>
                  </div>
                    </div>
                {currentUser && !userReview && !showReviewForm && selectedPrompt?.storageId && (
                  <Button
                    onClick={() => setShowReviewForm(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm"
                  >
                    Viết đánh giá
                  </Button>
                )}
                  </div>
                </div>

            {/* Comment Form - YouTube Style */}
            {selectedPrompt?.storageId ? (
              <div className="flex items-start space-x-3 mb-6">
                {/* User Avatar */}
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm text-white font-bold">
                    {currentUser ? getUserInitial((currentUser as any)?.fullName, (currentUser as any)?.email) : 'U'}
                  </span>
              </div>

                {/* Comment Input Area */}
                <div className="flex-1">
                  {currentUser ? (
                    !showReviewForm ? (
                      <div className="space-y-3">
                        {/* Inline comment input */}
                        <div className="relative">
                          <div className="absolute bottom-0 left-0 right-0 h-px bg-[#2a2a44]" />
                          <input
                            type="text"
                            placeholder="Thêm bình luận công khai..."
                            onClick={() => setShowReviewForm(true)}
                            className="w-full bg-transparent border-none outline-none text-white placeholder-neutral-500 pb-3 focus:pb-2 focus:border-b-2 focus:border-blue-500 transition-all"
                          />
              </div>
            </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Expanded comment form */}
                        <div className="space-y-3">
                          {/* Rating Selection */}
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-neutral-400">Đánh giá:</span>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                className="focus:outline-none hover:scale-110 transition-transform"
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    star <= reviewForm.rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-400'
                                  }`}
                                />
                              </button>
                    ))}
                  </div>

                          {/* Comment Textarea */}
                          <textarea
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                            placeholder="Chia sẻ trải nghiệm của bạn..."
                            rows={3}
                            className="w-full rounded-lg bg-[#1a1a2d] border border-[#2a2a44] px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            autoFocus
                          />
                  </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={cancelEditReview}
                            className="px-4 py-2 text-sm text-neutral-300 hover:text-white rounded-full hover:bg-[#2a2a44] transition-colors"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={() => editingReviewId ? handleUpdateReview(editingReviewId) : handleCreateReview()}
                            disabled={isSubmittingReview || !reviewForm.comment.trim() || !selectedPrompt?.storageId}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full text-sm font-medium transition-colors"
                          >
                            {isSubmittingReview ? 'Đang lưu...' : editingReviewId ? 'Cập nhật' : 'Bình luận'}
                          </button>
                    </div>
                  </div>
                    )
                  ) : (
                    <div className="text-sm text-neutral-400">
                      <button
                        onClick={() => navigate('/login')}
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        Đăng nhập
                      </button>
                      {' '}để thêm bình luận
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-red-400">⚠️</span>
                  <span className="text-sm text-red-400">
                    {error || 'Không tìm thấy template. Vui lòng tải lại trang hoặc liên hệ admin.'}
                  </span>
                  </div>
                {templates.length === 0 && (
                  <p className="text-xs text-neutral-400 mt-2">
                    Chưa có template nào được tạo cho môn này. Admin cần tạo template trước khi có thể bình luận.
                  </p>
                )}
                  </div>
            )}

            {/* Comments List - YouTube Style */}
            {!selectedPrompt?.storageId ? (
              <div className="text-center py-8 text-neutral-400">
                Không thể tải bình luận vì không tìm thấy template.
                      </div>
            ) : loadingReviews ? (
              <div className="text-center py-8 text-neutral-400">Đang tải bình luận...</div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 text-neutral-400">
                Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                    </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => {
                  const isOwner = currentUser?.userId === review.userId
                  // Try to get user info from review.user, or from usersMap
                  const reviewUser = review.user || usersMap.get(review.userId) || {}
                  const user = reviewUser
                  const reviewDate = new Date(review.createdAt || review.updatedAt || Date.now())
                  const isEditing = editingReviewId === review.reviewId
                  
                  // Get display name with fallback
                  const displayName = (user as any)?.fullName || (user as any)?.email || `User #${review.userId}`
                  
                  return (
                    <div key={review.reviewId} className="flex items-start space-x-3 group">
                      {/* User Avatar */}
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm text-white font-bold">
                          {getUserInitial((user as any)?.fullName, (user as any)?.email)}
                        </span>
              </div>

                      {/* Comment Content */}
                      <div className="flex-1 min-w-0">
                        {/* User Name, Time, and Rating */}
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-semibold text-white">
                            {displayName}
                            {isOwner && (
                              <span className="ml-2 text-xs text-blue-400 font-normal">(bản thân)</span>
                            )}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {getTimeAgo(reviewDate)}
                            {review.updatedAt && review.updatedAt !== review.createdAt && ' (đã chỉnh sửa)'}
                          </span>
                          {/* Rating Display */}
                          <div className="flex items-center space-x-1 ml-2">
                            {renderStars(review.rating, 'sm')}
                </div>
              </div>

                        {/* Comment Text */}
                        {isEditing ? (
                          <div className="space-y-3 mt-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-neutral-400">Đánh giá:</span>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                  className="focus:outline-none"
                                >
                                  <Star
                                    className={`w-4 h-4 ${
                                      star <= reviewForm.rating
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-400'
                                    }`}
                                  />
                                </button>
                    ))}
                  </div>
                            <textarea
                              value={reviewForm.comment}
                              onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                              rows={3}
                              className="w-full rounded-lg bg-[#1a1a2d] border border-[#2a2a44] px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                              autoFocus
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={cancelEditReview}
                                className="px-3 py-1.5 text-sm text-neutral-300 hover:text-white rounded-full hover:bg-[#2a2a44] transition-colors"
                              >
                                Hủy
                              </button>
                              <button
                                onClick={() => handleUpdateReview(review.reviewId)}
                                disabled={isSubmittingReview || !reviewForm.comment.trim()}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-full text-sm font-medium"
                              >
                                {isSubmittingReview ? 'Đang lưu...' : 'Lưu'}
                              </button>
                    </div>
                  </div>
                        ) : (
                          <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap break-words">
                            {review.comment}
                          </p>
                        )}
                        
                        {/* Action Buttons */}
                        {!isEditing && (
                          <div className="flex items-center justify-end mt-2">
                            {/* Menu for owner */}
                            {isOwner && (
                              <div className="relative">
                                <button
                                  onClick={() => setShowMenuId(showMenuId === review.reviewId ? null : review.reviewId)}
                                  className="p-1 hover:bg-[#2a2a44] rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <MoreVertical className="w-5 h-5 text-neutral-400" />
                                </button>
                                
                                {showMenuId === review.reviewId && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-10"
                                      onClick={() => setShowMenuId(null)}
                                    />
                                    <div className="absolute right-0 bottom-full mb-2 bg-[#1a1a2d] border border-[#2a2a44] rounded-lg shadow-xl z-20 min-w-[160px]">
                                      <button
                                        onClick={() => {
                                          startEditReview(review)
                                          setShowMenuId(null)
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#2a2a44] rounded-t-lg flex items-center space-x-2"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                        <span>Sửa</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          handleDeleteReview(review.reviewId)
                                          setShowMenuId(null)
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#2a2a44] rounded-b-lg flex items-center space-x-2"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Xóa</span>
                                      </button>
                  </div>
                                  </>
                                )}
                      </div>
                            )}
                    </div>
                        )}
                    </div>
                  </div>
                  )
                })}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PromptGrade10MathDetail