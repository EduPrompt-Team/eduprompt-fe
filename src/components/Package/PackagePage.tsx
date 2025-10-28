import React from 'react'
import HeaderHomepage from '@/components/Layout/HeaderHomepage'
import { useNavigate } from 'react-router-dom'
import { packageService } from '@/services/packageService'
import { packageCategoryService } from '@/services/packageCategoryService'

type PackageItem = {
  packageId: number
  packageName: string
  description?: string
  price: number
  categoryId?: number | null
}

type CategoryItem = {
  categoryId: number
  categoryName: string
}

const PackagePage: React.FC = () => {
  const navigate = useNavigate()
  const [packages, setPackages] = React.useState<PackageItem[]>([])
  const [categories, setCategories] = React.useState<CategoryItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = React.useState<number | 'all'>('all')
  const [search, setSearch] = React.useState('')
  const [sort, setSort] = React.useState<'new' | 'price_asc' | 'price_desc' | 'name_asc'>('new')

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const [pkgRes, cateRes] = await Promise.all([
          packageService.getAllPackages().catch(() => []),
          packageCategoryService.getActiveCategories().catch(() => []),
        ])
        if (!mounted) return
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

  const categoryMap = React.useMemo(() => {
    const m: Record<number, string> = {}
    categories.forEach((c) => { m[c.categoryId] = c.categoryName })
    return m
  }, [categories])

  const filtered = packages.filter((p) => {
    const byCate = selectedCategory === 'all' || p.categoryId === selectedCategory
    const bySearch = !search || p.packageName.toLowerCase().includes(search.toLowerCase())
    return byCate && bySearch
  }).sort((a, b) => {
    if (sort === 'price_asc') return a.price - b.price
    if (sort === 'price_desc') return b.price - a.price
    if (sort === 'name_asc') return a.packageName.localeCompare(b.packageName)
    return b.packageId - a.packageId // 'new' fallback
  })

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
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
              {categories.map((c) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#23233a] border border-[#2a2a44] rounded-xl p-4 animate-pulse">
                <div className="h-6 w-2/3 bg-[#2a2a44] rounded mb-3"></div>
                <div className="h-4 w-full bg-[#2a2a44] rounded mb-2"></div>
                <div className="h-4 w-5/6 bg-[#2a2a44] rounded mb-2"></div>
                <div className="h-6 w-24 bg-[#2a2a44] rounded mt-4"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <div key={p.packageId} className="bg-[#23233a] border border-[#2a2a44] rounded-xl p-4 flex flex-col">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-lg font-semibold">{p.packageName}</div>
                  {p.categoryId && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-[#1a1a2d] border border-[#2a2a44] text-neutral-300">
                      {categoryMap[p.categoryId] || '—'}
                    </span>
                  )}
                </div>
                <div className="text-sm text-neutral-300 mt-2 line-clamp-3">{p.description || '—'}</div>
                <div className="mt-3 text-emerald-400 font-semibold">{p.price.toLocaleString('vi-VN')} đ</div>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/package/${p.packageId}`)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-neutral-300">Không có gói phù hợp</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PackagePage


