import React from 'react'
import { useNavigate } from 'react-router-dom'
import HeaderHomepage from '@/components/Layout/HeaderHomepage'
import { packageService } from '@/services/packageService'
import { packageCategoryService } from '@/services/packageCategoryService'
import { walletService } from '@/services/walletService'
import { cartService } from '@/services/cartService'
import { orderService } from '@/services/orderService'
import { transactionService } from '@/services/transactionService'
import { paymentMethodService } from '@/services/paymentMethodService'
import { getCurrentUser } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import { TransactionStatus } from '@/types/status'

type PackageItem = {
  packageId: number
  packageName: string
  description?: string | null
  price: number
  categoryId?: number | null
  categoryName?: string | null  // Backend có thể trả về categoryName
  durationDays?: number | null
  durationMonths?: number | null  // Thời hạn theo tháng
  isActive?: boolean
  createdDate?: string
}

type CategoryItem = {
  categoryId: number
  categoryName: string
}

const PackagePage: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [packages, setPackages] = React.useState<PackageItem[]>([])
  const [categories, setCategories] = React.useState<CategoryItem[]>([])
  const [userCreatedCategories, setUserCreatedCategories] = React.useState<number[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = React.useState<number | 'all'>('all')
  const [search, setSearch] = React.useState('')
  const [sort, setSort] = React.useState<'new' | 'price_asc' | 'price_desc' | 'name_asc'>('new')
  const [processing, setProcessing] = React.useState<number | null>(null)

  // Load userCreatedCategories từ localStorage để đồng bộ với admin
  React.useEffect(() => {
    const saved = localStorage.getItem('userCreatedCategories')
    if (saved) {
      try {
        const ids = JSON.parse(saved)
        if (Array.isArray(ids)) {
          setUserCreatedCategories(ids)
        }
      } catch {}
    }
  }, [])

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Lấy packages trước
        const pkgRes = await packageService.getAllPackages().catch(() => [])
        if (!mounted) return
        
        // Thử lấy categories từ API
        let cateRes: CategoryItem[] = []
        try {
          cateRes = await packageCategoryService.getActiveCategories()
        } catch (e: any) {
          // Nếu API bị chặn (401/403), sẽ extract categories từ packages sau
          console.warn('[PackagePage] Không thể lấy categories từ API (có thể user không có quyền), sẽ extract từ packages:', e?.response?.status)
        }
        
        if (!mounted) return
        console.log('%c[DATALOG]', 'color: #00fdff', { pkgRes, cateRes })
        // Debug: Log duration fields từ packages
        if (pkgRes && pkgRes.length > 0) {
          console.log('%c[PACKAGE DURATION DEBUG]', 'color: #ff00ff', 
            pkgRes.map((p: any) => ({
              id: p.packageId,
              name: p.packageName,
              durationDays: p.durationDays,
              durationMonths: p.durationMonths,
              allFields: Object.keys(p)
            }))
          )
        }
        setPackages(pkgRes ?? [])
        setCategories(cateRes ?? [])
      } catch (e) {
        if (!mounted) return
        setError('Không thể tải dữ liệu gói')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  // Build categoryMap từ categories API hoặc từ packages (nếu packages có categoryName)
  const categoryMap = React.useMemo(() => {
    const m: Record<number, string> = {}
    
    // 1. Ưu tiên từ categories API
    categories.forEach((c) => { 
      m[c.categoryId] = c.categoryName 
    })
    
    // 2. Bổ sung từ packages nếu packages có categoryName (trường hợp API categories bị chặn)
    if (packages && packages.length > 0) {
      packages.forEach((p: PackageItem) => {
        if (p.categoryId && p.categoryName && !m[p.categoryId]) {
          m[p.categoryId] = p.categoryName
        }
      })
    }
    
    return m
  }, [categories, packages])

  // Chỉ hiển thị categories có trong packages (categories mà ít nhất có 1 package sử dụng)
  const uniqueCategories = React.useMemo(() => {
    // Bước 1: Lấy tất cả categoryId có trong packages
    const categoryIdsInPackages = new Set<number>()
    if (packages && packages.length > 0) {
      packages.forEach((p: PackageItem) => {
        if (p.categoryId) {
          categoryIdsInPackages.add(p.categoryId)
        }
      })
    }
    
    // Nếu không có packages hoặc không có categoryId nào, trả về rỗng
    if (categoryIdsInPackages.size === 0) {
      return []
    }
    
    let categoriesToProcess: CategoryItem[] = []
    
    // Bước 2: Ưu tiên lấy từ categories API (nếu có)
    if (categories && categories.length > 0) {
      // Filter chỉ lấy categories có trong packages
      let filtered = categories.filter((c: CategoryItem) =>
        categoryIdsInPackages.has(c.categoryId)
      )
      
      // Nếu có userCreatedCategories, ưu tiên filter theo đó
      if (userCreatedCategories.length > 0) {
        const filteredByUser = filtered.filter((c: CategoryItem) =>
          userCreatedCategories.includes(c.categoryId)
        )
        // Nếu filter theo userCreatedCategories có kết quả, dùng kết quả đó
        if (filteredByUser.length > 0) {
          filtered = filteredByUser
        }
      }
      
      categoriesToProcess = filtered
    } else if (packages && packages.length > 0) {
      // Bước 3: Fallback - extract từ packages trực tiếp
      const extractedFromPackages = new Map<number, CategoryItem>()
      
      packages.forEach((p: PackageItem) => {
        if (p.categoryId) {
          // Ưu tiên lấy từ package.categoryName trực tiếp
          // Nếu không có, lấy từ categoryMap
          const catName = p.categoryName || categoryMap[p.categoryId]
          
          if (catName && !extractedFromPackages.has(p.categoryId)) {
            extractedFromPackages.set(p.categoryId, {
              categoryId: p.categoryId,
              categoryName: catName
            })
          }
        }
      })
      
      categoriesToProcess = Array.from(extractedFromPackages.values())
    }
    
    // Bước 4: Loại bỏ trùng lặp theo tên và sắp xếp
    const seen = new Set<string>()
    const unique: CategoryItem[] = []
    
    categoriesToProcess.forEach((c: CategoryItem) => {
      const key = (c.categoryName || '').toLowerCase().trim()
      if (key && !seen.has(key)) {
        seen.add(key)
        unique.push(c)
      }
    })
    
    return unique.sort((a, b) => a.categoryName.localeCompare(b.categoryName))
  }, [categories, userCreatedCategories, packages, categoryMap])

  // Filter and sort packages
  const filteredAndSorted = React.useMemo(() => {
    let result = [...packages]

    // Search filter
    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter((p) =>
        p.packageName.toLowerCase().includes(term) ||
        (p.description || '').toLowerCase().includes(term)
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.categoryId === selectedCategory)
    }

    // Sort
    switch (sort) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'name_asc':
        result.sort((a, b) => a.packageName.localeCompare(b.packageName))
        break
      case 'new':
      default:
        result.sort((a, b) => {
          const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0
          const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0
          return dateB - dateA
        })
        break
    }

    return result
  }, [packages, search, selectedCategory, sort])

  // Fetch wallet balance on mount
  const [walletBalance, setWalletBalance] = React.useState<number | null>(null)
  const [purchasedPackages, setPurchasedPackages] = React.useState<Set<number>>(new Set())

  // Fetch wallet balance and purchased packages
  const fetchWalletAndPurchased = React.useCallback(async () => {
    try {
      const currentUser = getCurrentUser()
      if (currentUser?.userId) {
        // Fetch wallet balance
        try {
          const walletData = await walletService.getWalletByUserId(Number(currentUser.userId))
          setWalletBalance(walletData.balance || 0)
        } catch (e: any) {
          if (e?.response?.status === 404) {
            setWalletBalance(0) // Chưa có ví
          }
        }

        // Load purchased packages from localStorage
        const purchased = localStorage.getItem('purchasedPackages')
        if (purchased) {
          try {
            const packageIds = JSON.parse(purchased)
            if (Array.isArray(packageIds)) {
              setPurchasedPackages(new Set(packageIds))
            }
          } catch {}
        }
      }
    } catch (e) {
      console.error('Failed to fetch wallet balance:', e)
    }
  }, [])

  React.useEffect(() => {
    fetchWalletAndPurchased()
  }, [fetchWalletAndPurchased])

  // Refresh wallet balance khi quay lại từ topup page
  React.useEffect(() => {
    const handleFocus = () => {
      // Check if there's a payment success signal
      const paymentSuccess = localStorage.getItem('payment_test_success') || localStorage.getItem('vnpay_success')
      if (paymentSuccess) {
        fetchWalletAndPurchased()
        // Cleanup after refresh
        setTimeout(() => {
          localStorage.removeItem('payment_test_success')
          localStorage.removeItem('vnpay_success')
        }, 1000)
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [fetchWalletAndPurchased])

  // Handle payment - check balance first
  const handlePayment = async (packageId: number) => {
    try {
      setProcessing(packageId)
      
      const selectedPackage = packages.find(p => p.packageId === packageId)
      if (!selectedPackage) {
        showToast('Không tìm thấy gói này.', 'error')
        setProcessing(null)
        return
      }

      // Nếu là gói miễn phí
      if (selectedPackage.price === 0) {
        // Lưu vào purchased packages
        const newPurchased = new Set(purchasedPackages)
        newPurchased.add(packageId)
        setPurchasedPackages(newPurchased)
        localStorage.setItem('purchasedPackages', JSON.stringify(Array.from(newPurchased)))
        
        // Lưu ngày mua
        const purchasedDatesStr = localStorage.getItem('purchasedPackagesDates')
        const purchasedDates: Record<number, string> = purchasedDatesStr ? JSON.parse(purchasedDatesStr) : {}
        purchasedDates[packageId] = new Date().toISOString()
        localStorage.setItem('purchasedPackagesDates', JSON.stringify(purchasedDates))
        
        showToast('Kích hoạt gói miễn phí thành công!', 'success')
        setProcessing(null)
        return
      }

      const currentUser = getCurrentUser()
      if (!currentUser?.userId) {
        showToast('Vui lòng đăng nhập để thanh toán.', 'warning')
        setProcessing(null)
        return
      }

      // Fetch latest wallet balance
      let currentBalance = walletBalance
      try {
        const walletData = await walletService.getWalletByUserId(Number(currentUser.userId))
        currentBalance = walletData.balance || 0
        setWalletBalance(currentBalance)
      } catch (e: any) {
        if (e?.response?.status === 404) {
          currentBalance = 0 // Chưa có ví
        } else {
          console.warn('Could not fetch wallet balance:', e)
        }
      }

      // Kiểm tra số dư ví
      if (currentBalance === null || currentBalance < selectedPackage.price) {
        // Không đủ tiền → yêu cầu nạp tiền
        localStorage.setItem('selectedPackageForPayment', JSON.stringify({
          packageId: selectedPackage.packageId,
          packageName: selectedPackage.packageName,
          price: selectedPackage.price
        }))
        navigate('/wallet/topup')
        setProcessing(null)
        return
      }

      // Đủ tiền → thanh toán luôn
      try {
        // 1. Clear cart trước để tránh conflict với item cũ
        try {
          await cartService.clearCart()
        } catch (e) {
          // Ignore nếu cart không tồn tại hoặc đã rỗng
          console.warn('Could not clear cart (may be empty):', e)
        }

        // 2. Thêm package vào cart
        try {
          await cartService.addItem({
            packageId: selectedPackage.packageId,
            quantity: 1
          })
        } catch (addError: any) {
          // Nếu lỗi 400 (item đã tồn tại), thử lấy cart hiện tại và tạo order từ đó
          if (addError?.response?.status === 400) {
            console.warn('Package may already be in cart, proceeding with order creation')
            // Vẫn tiếp tục tạo order từ cart hiện tại
          } else {
            throw addError
          }
        }

        // 3. Tạo order từ cart
        const order = await orderService.createOrderFromCart({
          notes: `Mua gói ${selectedPackage.packageName}`
        })

        // 4. Tìm PaymentMethod (ví)
        let paymentMethodId = 1
        try {
          const methods = await paymentMethodService.getAllPaymentMethods()
          const walletMethod = methods.find((m: any) => 
            m.methodName?.toLowerCase().includes('wallet') || 
            m.provider?.toLowerCase().includes('wallet')
          )
          if (walletMethod) {
            paymentMethodId = walletMethod.paymentMethodId || walletMethod.id || 1
          }
        } catch (e) {
          console.warn('Could not get payment methods, using default')
        }

        // 5. Lấy wallet ID
        let walletId: number = 0
        try {
          const walletData = await walletService.getWalletByUserId(Number(currentUser.userId))
          walletId = walletData.walletId || 0
        } catch (e) {
          console.error('Could not get wallet ID:', e)
        }

        // 6. Tạo transaction với status "Pending"
        let transactionId: number | null = null
        if (walletId > 0) {
          try {
            const transaction = await transactionService.createTransaction({
              paymentMethodId,
              walletId,
              orderId: order.orderId,
              amount: selectedPackage.price,
              transactionType: 'Payment',
            })
            transactionId = transaction.transactionId || transaction.id || null
          } catch (e) {
            console.warn('Could not create transaction:', e)
          }
        }

        // 7. Trừ tiền từ ví
        await walletService.deductFunds({
          userId: Number(currentUser.userId),
          amount: selectedPackage.price,
        })

        // 8. Update transaction status thành "Completed"
        if (transactionId) {
          try {
            await transactionService.updateTransaction(transactionId, {
              status: TransactionStatus.Completed,
            })
          } catch (e) {
            console.warn('Could not update transaction status:', e)
          }
        }

        // 9. Update order status thành "Completed"
        try {
          await orderService.updateOrderStatus(order.orderId, 'Completed')
        } catch (e) {
          console.warn('Could not update order status:', e)
        }

        // 10. Lưu vào purchased packages
        const newPurchased = new Set(purchasedPackages)
        newPurchased.add(packageId)
        setPurchasedPackages(newPurchased)
        localStorage.setItem('purchasedPackages', JSON.stringify(Array.from(newPurchased)))
        
        // Lưu ngày mua vào purchasedPackagesDates
        const purchasedDatesStr = localStorage.getItem('purchasedPackagesDates')
        const purchasedDates: Record<number, string> = purchasedDatesStr ? JSON.parse(purchasedDatesStr) : {}
        purchasedDates[packageId] = new Date().toISOString()
        localStorage.setItem('purchasedPackagesDates', JSON.stringify(purchasedDates))

        // 11. Refresh wallet balance
        try {
          const walletData = await walletService.getWalletByUserId(Number(currentUser.userId))
          setWalletBalance(walletData.balance || 0)
        } catch (e) {
          setWalletBalance((currentBalance || 0) - selectedPackage.price)
        }

        // 12. Clear cart sau khi hoàn tất
        try {
          await cartService.clearCart()
        } catch (e) {
          console.warn('Could not clear cart after payment:', e)
        }

        showToast(`Mua gói "${selectedPackage.packageName}" thành công!`, 'success')
      } catch (error: any) {
        console.error('Payment processing error:', error)
        const errorMsg = error?.response?.data?.message || error?.message || 'Thanh toán thất bại. Vui lòng thử lại.'
        showToast(errorMsg, 'error')
      } finally {
        setProcessing(null)
      }
    } catch (error: any) {
      console.error('Failed to proceed to payment:', error)
      showToast('Không thể tiếp tục thanh toán. Vui lòng thử lại.', 'error')
      setProcessing(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1a2d] text-white">
      <HeaderHomepage />
      <div className="mx-auto max-w-7xl px-5 py-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold">Danh sách Package</h1>
          <div className="flex items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên gói..."
              className="h-10 rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 text-sm"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="h-10 rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 text-sm"
            >
              <option value="all">Tất cả danh mục</option>
              {uniqueCategories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="h-10 rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 text-sm"
            >
              <option value="new">Mới nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="name_asc">Tên A → Z</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-2 border-[#2a2a44] rounded-2xl p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 w-20 bg-[#2a2a44] rounded-full"></div>
                  <div className="h-6 w-16 bg-[#2a2a44] rounded-lg"></div>
                </div>
                <div className="h-7 w-3/4 bg-[#2a2a44] rounded mb-4"></div>
                <div className="h-10 w-1/2 bg-[#2a2a44] rounded mb-4"></div>
                <div className="h-4 w-full bg-[#2a2a44] rounded mb-2"></div>
                <div className="h-4 w-5/6 bg-[#2a2a44] rounded mb-6"></div>
                <div className="h-12 w-full bg-[#2a2a44] rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSorted.map((p, index) => {
              const categoryLabel = p.categoryId ? (categoryMap[p.categoryId] || 'Unknown') : 'Unknown'
              const isFree = p.price === 0
              const isHighlighted = index % 3 === 1 // Highlight middle card in each row
              
              // Category badge colors
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
                  key={p.packageId}
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
                      {p.packageName}
                    </h3>

                    {/* Price - Highlighted */}
                    <div className="mb-4">
                      {isFree ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-white">Miễn phí</span>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold text-white">{p.price.toLocaleString('vi-VN')}</span>
                          <span className="text-xl text-neutral-400">₫</span>
                        </div>
                      )}
                    </div>

                    {/* Package Details - Full Information */}
                    <div className="space-y-2 mb-4 bg-[#1a1a2e]/50 rounded-lg p-3 border border-[#2a2a44]/50">
                      {/* Thời hạn - Luôn hiển thị, nếu không có data thì hiển thị "—" */}
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          <strong className="text-neutral-300">Thời hạn:</strong>{' '}
                          {p.durationMonths ? `${p.durationMonths} tháng` : p.durationDays ? `${p.durationDays} ngày` : '—'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span><strong className="text-neutral-300">Trạng thái:</strong> {p.isActive ? <span className="text-green-400">Hoạt động</span> : <span className="text-red-400">Không hoạt động</span>}</span>
                      </div>
                    </div>

                    {/* Description - Scrollable if too long */}
                    {p.description && (
                      <div className="mb-4 bg-[#1a1a2e]/50 rounded-lg p-3 border border-[#2a2a44]/50 flex-shrink-0">
                        <div className="max-h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#2a2a44] scrollbar-track-transparent">
                          <p className="text-sm text-neutral-300 leading-relaxed break-words whitespace-normal overflow-wrap-anywhere pr-2">
                            {p.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CTA Button - Fixed at bottom */}
                  <div className="mt-auto pt-4 border-t border-[#2a2a44]/50">
                    {purchasedPackages.has(p.packageId) ? (
                      // Đã mua → Hiển thị nút "Đã mua" (disabled)
                      <button
                        disabled
                        className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 bg-gradient-to-r from-gray-600 to-gray-500 opacity-60 cursor-not-allowed"
                      >
                        Đã mua
                      </button>
                    ) : (
                      // Chưa mua → Hiển thị nút "Thanh toán"
                      <button
                        onClick={() => handlePayment(p.packageId)}
                        disabled={processing === p.packageId || !p.isActive}
                        className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                          isHighlighted
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/30'
                            : isFree
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500'
                        } hover:scale-105 active:scale-95`}
                      >
                        {processing === p.packageId ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Đang xử lý...
                          </span>
                        ) : isFree ? (
                          'Sử dụng miễn phí'
                        ) : (
                          'Thanh toán'
                        )}
                      </button>
                    )}
                    {!p.isActive && (
                      <p className="text-xs text-red-400 text-center mt-2">Gói này hiện không khả dụng</p>
                    )}
                  </div>

                  {/* Decorative gradient overlay */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -z-10"></div>
                </div>
              )
            })}
            {filteredAndSorted.length === 0 && (
              <div className="col-span-full text-neutral-300 text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-lg font-semibold mb-2">
                  {search || selectedCategory !== 'all' ? 'Không tìm thấy gói phù hợp' : 'Chưa có gói nào'}
                </p>
                <p className="text-sm text-neutral-400">
                  {search || selectedCategory !== 'all' ? 'Thử tìm kiếm với từ khóa khác' : 'Các gói sẽ được hiển thị ở đây'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PackagePage


