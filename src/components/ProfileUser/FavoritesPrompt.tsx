import React, { useState, useEffect } from 'react'
import { Heart, Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { wishlistService } from '@/services/wishlistService'
import { packageService } from '@/services/packageService'
import { storageTemplateService } from '@/services/storageTemplateService'
import { useToast } from '@/components/ui/toast'
import type { WishlistItem } from '@/services/wishlistService'
import type { Package } from '@/services/packageService'
import type { StorageTemplate } from '@/services/storageTemplateService'

interface WishlistItemWithPackage extends WishlistItem {
  package?: Package | null
  template?: any | null // StorageTemplate if available
}

const FavoritesPrompt: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [wishlistItems, setWishlistItems] = useState<WishlistItemWithPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set())
  const defaultImage = new URL('../../assets/Image/Toan10.png', import.meta.url).href

  const slugify = (value: string) =>
    (value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')

  const resolveSubjectSlug = (label: string) => {
    if (!label) return ''
    const subjectMap: Record<string, string> = {
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
    const lower = label.trim().toLowerCase()
    const direct = Object.entries(subjectMap).find(([, display]) => display.toLowerCase() === lower)
    if (direct) return direct[0]
    const normalized = slugify(label)
    const normalizedMatch = Object.entries(subjectMap).find(([, display]) => slugify(display) === normalized)
    return normalizedMatch ? normalizedMatch[0] : normalized
  }

  const generateChapterSlug = (chapter: string) => {
    if (!chapter) return ''
    const match = chapter.match(/\d+/)
    const num = match ? match[0] : ''
    return num ? `chuong${num}` : slugify(chapter)
  }

  useEffect(() => {
    let isMounted = true

    async function loadWishlist() {
      try {
        setLoading(true)
        setError(null)
        const [items, publicTemplates, myTemplates] = await Promise.all([
          wishlistService.getMyWishlist(),
          storageTemplateService.getPublicTemplates({}).catch(() => []),
          storageTemplateService.getMyStorage().catch(() => [])
        ])
        
        console.log('[FavoritesPrompt] Raw wishlist response:', items)
        
        if (!isMounted) return

        if (!items || (Array.isArray(items) && items.length === 0)) {
          console.log('[FavoritesPrompt] Wishlist is empty')
          if (isMounted) {
            setWishlistItems([])
          }
          return
        }

        const itemsArray = Array.isArray(items) ? items : [items]
        console.log('[FavoritesPrompt] Processing', itemsArray.length, 'wishlist items')

        const templateMap = new Map<number, StorageTemplate>()
        ;(Array.isArray(publicTemplates) ? publicTemplates : []).forEach((tpl: any) => {
          if (tpl?.storageId) templateMap.set(tpl.storageId, tpl)
        })
        ;(Array.isArray(myTemplates) ? myTemplates : []).forEach((tpl: any) => {
          if (tpl?.storageId) templateMap.set(tpl.storageId, { ...templateMap.get(tpl.storageId), ...tpl })
        })

        // Load storage template details for each wishlist item
        const itemsWithTemplates = await Promise.all(
          itemsArray.map(async (item) => {
            try {
              let template: StorageTemplate | null = null
              const storageIdToUse = item.storageId ?? null
              if (storageIdToUse && templateMap.has(storageIdToUse)) {
                template = templateMap.get(storageIdToUse) || null
              }

              if (!template && item.templateContent) {
                try {
                  const parsed = JSON.parse(item.templateContent)
                  template = {
                    storageId: storageIdToUse || parsed?.storageId || 0,
                    packageId: parsed?.packageId || item.packageId || 0,
                    templateName: parsed?.templateName || item.templateName || `Template ${item.wishlistId}`,
                    templateContent: parsed?.content || item.templateContent,
                    grade: parsed?.grade || item.grade || undefined,
                    subject: parsed?.subject || item.subject || undefined,
                    chapter: parsed?.chapter || item.chapter || undefined,
                    userId: parsed?.userId || undefined,
                    isPublic: parsed?.isPublic ?? item.isPublic ?? true,
                    createdAt: parsed?.createdAt || item.templateCreatedAt || item.addedAt || new Date().toISOString()
                  } as StorageTemplate
                } catch (parseErr) {
                  console.warn(`[FavoritesPrompt] Failed to parse templateContent for wishlist ${item.wishlistId}:`, parseErr)
                }
              }
              
              // Try to get package info as fallback
              let pkg: Package | null = null
              if (item.packageId) {
                try {
                  pkg = await packageService.getPackageById(item.packageId)
                  console.log(`[FavoritesPrompt] Package loaded for item ${item.wishlistId}:`, pkg)
                } catch (err) {
                  console.warn(`[FavoritesPrompt] Failed to load package ${item.packageId}:`, err)
                }
              }
              
              // Prefer template over package for display
              if (template) {
                return { ...item, template, package: pkg }
              } else if (pkg) {
                return { ...item, package: pkg, template: null }
              } else {
                // Fallback if neither found
                return { 
                  ...item, 
                  package: {
                    packageId: item.packageId,
                    packageName: `Template ${item.packageId}`,
                    description: 'Không thể tải thông tin',
                  } as Package, 
                  template: null 
                }
              }
            } catch (err: any) {
              console.error(`[FavoritesPrompt] Failed to load item ${item.wishlistId}:`, err)
              return { 
                ...item, 
                package: {
                  packageId: item.packageId,
                  packageName: `Item ${item.packageId}`,
                  description: 'Không thể tải thông tin',
                } as Package, 
                template: null 
              }
            }
          })
        )

        if (isMounted) {
          console.log('[FavoritesPrompt] Final items with templates:', itemsWithTemplates)
          // Show all items, even if template/package load failed (they have fallback data)
          setWishlistItems(itemsWithTemplates)
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('[FavoritesPrompt] Failed to load wishlist:', err)
          setError(err?.response?.data?.message || 'Không thể tải danh sách yêu thích')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadWishlist()
    
    // Listen for wishlist update events
    const handleWishlistUpdate = () => {
      console.log('[FavoritesPrompt] Wishlist updated, reloading...')
      loadWishlist()
    }
    
    window.addEventListener('wishlistUpdated', handleWishlistUpdate)
    
    return () => {
      isMounted = false
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate)
    }
  }, [])

  const handleRemoveFavorite = async (e: React.MouseEvent, wishlistId: number) => {
    e.stopPropagation()
    
    if (removingIds.has(wishlistId)) return

    try {
      setRemovingIds(prev => new Set(prev).add(wishlistId))
      await wishlistService.removeFromWishlist(wishlistId)
      setWishlistItems(prev => prev.filter(item => item.wishlistId !== wishlistId))
      showToast('Đã xóa khỏi Prompt yêu thích', 'success')
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('wishlistUpdated'))
    } catch (err: any) {
      console.error('[FavoritesPrompt] Failed to remove from wishlist:', err)
      showToast(err?.response?.data?.message || 'Không thể xóa khỏi yêu thích', 'error')
    } finally {
      setRemovingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(wishlistId)
        return newSet
      })
    }
  }

  const handleItemClick = (item: WishlistItemWithPackage) => {
    // If has template, navigate to template detail page
    if (item.template) {
      const grade = item.template.grade || '10'
      const subjectVi = item.template.subject || ''
      const chapter = item.template.chapter || ''
      const subjectSlug = resolveSubjectSlug(subjectVi)
      const chapterSlug = generateChapterSlug(chapter || 'Chương 1')

      navigate(`/grade/${grade}/${subjectSlug}/detail/${chapterSlug}`)
    } else {
      // Otherwise, navigate to packages page
      navigate('/packages')
    }
  }

  return (
    <div className="py-8 px-10">
      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold">Prompt yêu thích</h1>
      <p className="text-neutral-400 mt-1">Quản lý và xem lại các prompt yêu thích</p>
      <div className="mt-4 h-0.5 -mx-10 bg-white"></div>

      {/* Loading State */}
      {loading && (
        <div className="mt-6 text-center text-neutral-400">
          Đang tải danh sách yêu thích...
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="mt-6 text-center text-red-400">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && wishlistItems.length === 0 && (
        <div className="mt-6 text-center py-12">
          <p className="text-neutral-400 text-lg mb-4">Chưa có prompt nào trong yêu thích</p>
          <p className="text-neutral-500 text-sm">Hãy thêm prompt vào yêu thích từ trang chi tiết prompt</p>
        </div>
      )}

      {/* Wishlist Items Grid */}
      {!loading && !error && wishlistItems.length > 0 && (
        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlistItems.map((item) => {
            const pkg = item.package
            const template = item.template
            const displayName = template?.templateName || pkg?.packageName || 'Prompt'
            const description = template?.subject && template?.chapter 
              ? `${template.subject} • ${template.chapter}`
              : pkg?.description || ''
            const grade = template?.grade || '10'
            
            return (
              <button
                key={item.wishlistId}
                onClick={() => handleItemClick(item)}
                className="group relative bg-[#23233a] rounded-2xl border border-[#2a2a44] hover:border-[#3a3a54] transition-all duration-300 hover:scale-105 hover:shadow-2xl h-96 overflow-hidden w-full text-left"
              >
                {/* Top-right favorite heart icon */}
                <button 
                  type="button"
                  onClick={(e) => handleRemoveFavorite(e, item.wishlistId)}
                  disabled={removingIds.has(item.wishlistId)}
                  className="absolute top-3 right-3 z-20 inline-flex items-center justify-center rounded-full p-1.5 bg-black/30 hover:bg-black/40 transition-colors disabled:opacity-50"
                >
                  <Heart 
                    className="w-5 h-5 text-red-500"
                    fill="currentColor"
                  />
                </button>

                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-2xl"
                  style={{ backgroundImage: `url(${defaultImage})` }}
                >
                  <div className="absolute inset-0 bg-black/75 rounded-2xl"></div>
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10 pb-6 md:pb-12">
                  <h3 className="mt-2 text-2xl font-bold text-white mb-2 line-clamp-2">
                    {displayName}
                  </h3>
                  {description && (
                    <p className="text-sm text-neutral-300 mb-2 line-clamp-2">
                      {description}
                    </p>
                  )}
                  {grade && (
                    <p className="text-xs text-neutral-400 mb-4">
                      Lớp {grade}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center space-x-4 text-xs text-neutral-400 mb-4">
                    <span className="flex items-center">
                      <Download className="w-3 h-3 mr-1" />
                      0
                    </span>
                    <span className="flex items-center">
                      <Heart className="w-3 h-3 mr-1" />
                      1
                    </span>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-auto flex gap-2">
                    <button
                      className="inline-flex items-center gap-2 px-5 md:px-6 py-2 md:py-2.5 rounded-full bg-gradient-to-r from-pink-700 to-pink-500 hover:from-pink-600 hover:to-pink-400 text-white text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md hover:shadow-lg"
                    >
                      Xem Prompt
                    </button>
                  </div>
                </div>

                {/* Hover glows */}
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-md"></div>
                <div className="pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-r from-pink-500 to-rose-600 opacity-0 group-hover:opacity-60 transition-all duration-300 -z-10 blur-xl"></div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FavoritesPrompt
