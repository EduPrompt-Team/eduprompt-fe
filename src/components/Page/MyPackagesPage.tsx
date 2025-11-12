import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import HeaderHomepage from '@/components/Layout/HeaderHomepage'
import SiderBar from '@/components/ProfileUser/SiderBar'
import { packageService } from '@/services/packageService'
import { packageCategoryService } from '@/services/packageCategoryService'
import { useToast } from '@/components/ui/toast'

type PackageItem = {
  packageId: number
  packageName: string
  description?: string | null
  price: number
  categoryId?: number | null
  categoryName?: string | null
  durationDays?: number | null
  durationMonths?: number | null
  isActive?: boolean
  createdDate?: string
  purchasedDate?: string
}

const MyPackagesPage: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [purchasedPackages, setPurchasedPackages] = React.useState<PackageItem[]>([])
  const [categories, setCategories] = React.useState<{ categoryId: number; categoryName: string }[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        
        // Lấy danh sách package IDs đã mua từ localStorage
        const purchasedIdsStr = localStorage.getItem('purchasedPackages')
        if (!purchasedIdsStr) {
          setPurchasedPackages([])
          setLoading(false)
          return
        }

        const purchasedIds: number[] = JSON.parse(purchasedIdsStr)
        if (!Array.isArray(purchasedIds) || purchasedIds.length === 0) {
          setPurchasedPackages([])
          setLoading(false)
          return
        }

        // Lấy thông tin chi tiết của các packages đã mua
        const [allPackages, allCategories] = await Promise.all([
          packageService.getAllPackages().catch(() => []),
          packageCategoryService.getActiveCategories().catch(() => [])
        ])
        
        const purchased = allPackages.filter((p: any) => purchasedIds.includes(p.packageId || p.id))
        
        // Load purchased dates from localStorage nếu có
        const purchasedDatesStr = localStorage.getItem('purchasedPackagesDates')
        const purchasedDates: Record<number, string> = purchasedDatesStr ? JSON.parse(purchasedDatesStr) : {}
        
        const packagesWithDates = purchased.map((p: any) => ({
          ...p,
          purchasedDate: purchasedDates[p.packageId || p.id] || new Date().toISOString()
        }))

        setPurchasedPackages(packagesWithDates)
        setCategories(allCategories ?? [])
      } catch (error: any) {
        console.error('Failed to load purchased packages:', error)
        showToast('Không thể tải danh sách gói đã mua.', 'error')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleRemovePackage = (packageId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa gói này khỏi danh sách không?')) {
      const purchasedIdsStr = localStorage.getItem('purchasedPackages')
      if (purchasedIdsStr) {
        try {
          const purchasedIds: number[] = JSON.parse(purchasedIdsStr)
          const updated = purchasedIds.filter(id => id !== packageId)
          localStorage.setItem('purchasedPackages', JSON.stringify(updated))
          setPurchasedPackages(prev => prev.filter(p => p.packageId !== packageId))
          showToast('Đã xóa gói khỏi danh sách.', 'success')
        } catch (e) {
          console.error('Failed to remove package:', e)
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <HeaderHomepage />
      <div className="flex">
        <SiderBar />
        <main className="flex-1 bg-[#23233a] text-white min-h-[calc(100vh-4rem)] px-0">
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold">Quản lý gói đã mua</h1>
              <p className="text-neutral-400 mt-2">Danh sách các gói bạn đã mua và kích hoạt</p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto"></div>
                <p className="mt-4 text-neutral-400">Đang tải...</p>
              </div>
            ) : purchasedPackages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-neutral-400 text-5xl mb-4">📦</div>
                <p className="text-neutral-300 text-lg mb-2">Chưa có gói nào được mua</p>
                <p className="text-sm text-neutral-500 mb-6">
                  Các gói bạn mua sẽ được hiển thị ở đây
                </p>
                <Link
                  to="/packages"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-medium"
                >
                  Xem danh sách gói
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchasedPackages.map((pkg, index) => {
                  // Build categoryMap
                  const categoryMap: Record<number, string> = {}
                  categories.forEach((c) => {
                    categoryMap[c.categoryId] = c.categoryName
                  })
                  if (pkg.categoryId && pkg.categoryName) {
                    categoryMap[pkg.categoryId] = pkg.categoryName
                  }
                  
                  const categoryLabel = pkg.categoryId ? (categoryMap[pkg.categoryId] || 'Unknown') : 'Unknown'
                  const isFree = pkg.price === 0
                  const isHighlighted = index % 3 === 1 // Highlight middle card in each row
                  
                  // Category badge colors - giống PackagePage
                  const getCategoryBadgeClass = (category: string) => {
                    const cat = category.toLowerCase()
                    if (cat.includes('free') || cat.includes('miễn phí')) {
                      return 'bg-green-500/20 text-green-400 border-green-500/30'
                    } else if (cat.includes('pro') || cat.includes('premium')) {
                      return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    } else if (cat.includes('max') || cat.includes('master')) {
                      return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                    }
                    return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                  }
                  
                  return (
                    <div
                      key={pkg.packageId}
                      className={`relative bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-2 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex flex-col h-full ${
                        isHighlighted
                          ? 'border-blue-500/50 shadow-lg shadow-blue-500/20'
                          : 'border-[#2a2a44] hover:border-[#3a3a5a]'
                      }`}
                    >
                      {/* Content area - flex-1 to push button to bottom */}
                      <div className="flex-1 flex flex-col">
                        {/* Category Badge */}
                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryBadgeClass(categoryLabel)}`}>
                            {categoryLabel}
                          </span>
                          {isFree && (
                            <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg text-xs font-bold text-white">
                              FREE
                            </span>
                          )}
                        </div>

                        {/* Package Name */}
                        <h3 className="text-2xl font-bold mb-2 text-white">
                          {pkg.packageName}
                        </h3>

                        {/* Price - Highlighted */}
                        <div className="mb-4">
                          {isFree ? (
                            <div className="flex items-baseline gap-2">
                              <span className="text-4xl font-bold text-white">Miễn phí</span>
                            </div>
                          ) : (
                            <div className="flex items-baseline gap-2">
                              <span className="text-4xl font-bold text-white">{pkg.price.toLocaleString('vi-VN')}</span>
                              <span className="text-xl text-neutral-400">₫</span>
                            </div>
                          )}
                        </div>

                        {/* Package Details - Full Information */}
                        <div className="space-y-2 mb-4 bg-[#1a1a2e]/50 rounded-lg p-3 border border-[#2a2a44]/50">
                          {/* Thời hạn - Luôn hiển thị */}
                          <div className="flex items-center gap-2 text-sm text-neutral-400">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>
                              <strong className="text-neutral-300">Thời hạn:</strong>{' '}
                              {pkg.durationMonths ? `${pkg.durationMonths} tháng` : pkg.durationDays ? `${pkg.durationDays} ngày` : '—'}
                            </span>
                          </div>
                          
                          {/* Ngày mua */}
                          {pkg.purchasedDate && (
                            <div className="flex items-center gap-2 text-sm text-neutral-400">
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>
                                <strong className="text-neutral-300">Ngày mua:</strong>{' '}
                                {new Date(pkg.purchasedDate).toLocaleDateString('vi-VN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  timeZone: 'Asia/Ho_Chi_Minh'
                                })}
                              </span>
                            </div>
                          )}
                          
                          {/* Trạng thái: Đã kích hoạt */}
                          <div className="flex items-center gap-2 text-sm text-neutral-400">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span><strong className="text-neutral-300">Trạng thái:</strong> <span className="text-green-400">Đã kích hoạt</span></span>
                          </div>
                        </div>

                        {/* Description - Scrollable if too long */}
                        {pkg.description && (
                          <div className="mb-4 bg-[#1a1a2e]/50 rounded-lg p-3 border border-[#2a2a44]/50 flex-shrink-0">
                            <div className="max-h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#2a2a44] scrollbar-track-transparent">
                              <p className="text-sm text-neutral-300 leading-relaxed break-words whitespace-normal overflow-wrap-anywhere pr-2">
                                {pkg.description}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* CTA Button - Fixed at bottom */}
                      <div className="mt-auto pt-4 border-t border-[#2a2a44]/50">
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate('/packages')}
                            className="flex-1 py-3 rounded-xl font-semibold text-white transition-all duration-300 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 hover:scale-105 active:scale-95"
                          >
                            Xem chi tiết
                          </button>
                          <button
                            onClick={() => handleRemovePackage(pkg.packageId)}
                            className="px-4 py-3 rounded-xl font-semibold text-white transition-all duration-300 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 hover:scale-105 active:scale-95"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>

                      {/* Decorative gradient overlay */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -z-10"></div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default MyPackagesPage

