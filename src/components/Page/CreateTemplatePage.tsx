import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HeaderHomepage from '@/components/Layout/HeaderHomepage'
import SiderBar from '@/components/ProfileUser/SiderBar'
import { storageTemplateService, type Grade } from '@/services/storageTemplateService'
import { orderService } from '@/services/orderService'
import { packageService } from '@/services/packageService'
import { getCurrentUser } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import type { Package } from '@/services/packageService'
import type { Order } from '@/services/orderService'

const subjectOptions = [
  { slug: 'math', label: 'Toán' },
  { slug: 'literature', label: 'Ngữ văn' },
  { slug: 'english', label: 'Tiếng Anh' },
  { slug: 'chemistry', label: 'Hóa học' },
  { slug: 'history', label: 'Lịch sử' },
  { slug: 'geography', label: 'Địa lý' },
  { slug: 'informatics', label: 'Tin học' },
  { slug: 'technology', label: 'Công nghệ' },
  { slug: 'physics', label: 'Vật lý' },
  { slug: 'biology', label: 'Sinh học' },
]

const subjectLabelMap = subjectOptions.reduce<Record<string, string>>((acc, option) => {
  acc[option.slug] = option.label
  return acc
}, {})

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

const formatChapterDisplay = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return ''

  const digitMatch = trimmed.match(/\d+/)
  if (digitMatch) {
    return `Chương ${digitMatch[0]}`
  }

  if (/^chương\s*/i.test(trimmed)) {
    const replaced = trimmed.replace(/^chương\s*/i, 'Chương ')
    return replaced.charAt(0).toUpperCase() + replaced.slice(1)
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

const generateChapterSlug = (display: string) => {
  const digitMatch = display.match(/\d+/)
  if (digitMatch) {
    return `chuong${digitMatch[0]}`
  }
  return slugify(display)
}

const buildTemplateContent = ({
  grade,
  subject,
  chapter,
  chapterSlug,
  subjectSlug,
  content,
  createdBy
}: {
  grade: string
  subject: string
  chapter: string
  chapterSlug: string
  subjectSlug: string
  content: string
  createdBy?: string
}) => {
  const routePath = `/grade/${grade}/${subjectSlug}/detail/${chapterSlug}`
  return JSON.stringify(
    {
      grade,
      subject,
      chapter,
      chapterSlug,
      route: routePath,
      content,
      createdBy: createdBy || undefined,
      createdAt: new Date().toISOString()
    },
    null,
    2
  )
}

const CreateTemplatePage: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const publishTemplate = async (storageId: number) => {
    try {
      await storageTemplateService.publishTemplate(storageId)
      showToast('Template đã được public và hiển thị cho mọi người.', 'success')
      return true
    } catch (error: any) {
      console.warn('[CreateTemplate] Failed to publish template:', error)
      showToast(
        error?.response?.data?.message ||
          'Không thể public template ngay lúc này. Template của bạn vẫn được lưu ở Kho cá nhân.',
        'warning'
      )
      return false
    }
  }
  const [templateName, setTemplateName] = useState('')
  const [templateContent, setTemplateContent] = useState('')
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null)
  const [grade, setGrade] = useState<Grade | ''>('')
  const [subjectSlug, setSubjectSlug] = useState<string>('')
  const [chapter, setChapter] = useState<string>('')
  const [purchasedPackages, setPurchasedPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingPackages, setLoadingPackages] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPurchasedPackages()
  }, [])

  const fetchPurchasedPackages = async () => {
    try {
      setLoadingPackages(true)
      const currentUser = getCurrentUser()
      if (!currentUser?.userId) {
        setError('Vui lòng đăng nhập')
        setLoadingPackages(false)
        return
      }

      // Lấy tất cả orders của user
      const myOrders = await orderService.getMyOrders()
      
      // Lọc các orders đã hoàn thành (Completed hoặc Paid)
      const completedOrders = myOrders.filter(
        (order: Order) => order.status === 'Completed' || order.status === 'Paid'
      )

      // Lấy tất cả packageIds từ orders đã hoàn thành
      const purchasedPackageIds = new Set<number>()
      completedOrders.forEach((order: Order) => {
        // Kiểm tra packageId trong order hoặc trong items
        if (order.packageId) {
          purchasedPackageIds.add(order.packageId)
        }
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            if (item.packageId) {
              purchasedPackageIds.add(item.packageId)
            }
          })
        }
      })

      if (purchasedPackageIds.size === 0) {
        setPurchasedPackages([])
        setLoadingPackages(false)
        return
      }

      // Lấy thông tin chi tiết của các packages đã mua
      const allPackages = await packageService.getAllPackages()
      const purchased = allPackages.filter((pkg: Package) =>
        purchasedPackageIds.has(pkg.packageId)
      )

      setPurchasedPackages(purchased)
    } catch (err: any) {
      console.error('Failed to fetch purchased packages:', err)
      showToast('Không thể tải danh sách packages đã mua', 'error')
      setError(err?.response?.data?.message || 'Không thể tải danh sách packages')
    } finally {
      setLoadingPackages(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const currentUser = getCurrentUser()
      if (!currentUser?.userId) {
        setError('Vui lòng đăng nhập')
        return
      }

      if (!selectedPackageId) {
        setError('Vui lòng chọn package đã mua')
        return
      }

      if (!templateName.trim()) {
        setError('Vui lòng nhập tên template')
        return
      }

      if (!grade) {
        setError('Vui lòng chọn khối')
        return
      }

      if (!subjectSlug) {
        setError('Vui lòng chọn môn')
        return
      }

      const gradeValue = grade as Grade
      const subjectName = subjectLabelMap[subjectSlug]
      if (!subjectName) {
        setError('Môn học không hợp lệ')
        return
      }

      const chapterDisplay = formatChapterDisplay(chapter)

      if (!chapterDisplay) {
        setError('Vui lòng nhập chương hợp lệ')
        return
      }

      const chapterSlug = generateChapterSlug(chapterDisplay)
      const subjectSlugValue = subjectSlug

      const metadataContent = buildTemplateContent({
        grade: gradeValue,
        subject: subjectName,
        chapter: chapterDisplay,
        chapterSlug,
        subjectSlug: subjectSlugValue,
        content: templateContent.trim(),
        createdBy: currentUser.fullName || currentUser.email || undefined
      })

      const createdTemplate = await storageTemplateService.saveTemplate({
        packageId: selectedPackageId,
        templateName: templateName.trim(),
        templateContent: metadataContent,
        grade: gradeValue,
        subject: subjectName,
        chapter: chapterDisplay,
        isPublic: true
      })

      await publishTemplate(createdTemplate.storageId)

      showToast('Đã tạo template thành công!', 'success')
      
      // Nếu có đủ thông tin grade, subject, chapter thì navigate đến route đó
      if (gradeValue && subjectName && chapterDisplay) {
        const routePath = `/grade/${gradeValue}/${subjectSlugValue}/detail/${chapterSlug}`
        window.dispatchEvent(new CustomEvent('publicTemplatesUpdated', { detail: { template: createdTemplate } }))
        navigate(routePath)
      } else {
        navigate('/mystorage')
      }
    } catch (err: any) {
      console.error('Failed to create template:', err)
      setError(err?.response?.data?.message || 'Không thể tạo template')
      showToast(err?.response?.data?.message || 'Không thể tạo template', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <HeaderHomepage />
      <div className="flex">
        <SiderBar />
        <main className="flex-1 bg-[#23233a] text-white min-h-[calc(100vh-4rem)] px-0">
          <div className="max-w-4xl mx-auto px-4 py-16">
            <h1 className="text-3xl font-bold mb-8">Tạo Template Prompt</h1>

            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 text-red-400">
                {error}
              </div>
            )}

            {loadingPackages ? (
              <div className="text-center py-8">
                <div className="text-neutral-400">Đang tải danh sách packages...</div>
              </div>
            ) : purchasedPackages.length === 0 ? (
              <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mb-6 text-yellow-400">
                <p className="font-semibold mb-2">Bạn chưa mua package nào</p>
                <p className="text-sm mb-4">Vui lòng mua package trước khi tạo template.</p>
                <Button
                  onClick={() => navigate('/packages')}
                  className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400"
                >
                  Đi đến trang Packages
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Chọn Package đã mua *
                  </label>
                  <select
                    value={selectedPackageId || ''}
                    onChange={(e) => setSelectedPackageId(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-[#1a1a2d] border border-[#2f2f4a] rounded-lg text-white focus:outline-none focus:border-[#60a5fa]"
                    required
                  >
                    <option value="">-- Chọn package đã mua --</option>
                    {purchasedPackages.map((pkg) => (
                      <option key={pkg.packageId} value={pkg.packageId}>
                        {pkg.packageName}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-neutral-400 mt-1">
                    Chỉ hiển thị các packages bạn đã mua
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tên Template *</label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="w-full px-4 py-2 bg-[#1a1a2d] border border-[#2f2f4a] rounded-lg text-white focus:outline-none focus:border-[#60a5fa]"
                    placeholder="Nhập tên template prompt"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Khối *</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value as Grade | '')}
                      className="w-full px-4 py-2 bg-[#1a1a2d] border border-[#2f2f4a] rounded-lg text-white focus:outline-none focus:border-[#60a5fa]"
                      required
                    >
                      <option value="">-- Chọn khối --</option>
                      <option value="10">Lớp 10</option>
                      <option value="11">Lớp 11</option>
                      <option value="12">Lớp 12</option>
                    </select>
                  </div>

                  <div>
                  <label className="block text-sm font-medium mb-2">Môn *</label>
                  <select
                    value={subjectSlug}
                    onChange={(e) => setSubjectSlug(e.target.value)}
                    className="w-full px-4 py-2 bg-[#1a1a2d] border border-[#2f2f4a] rounded-lg text-white focus:outline-none focus:border-[#60a5fa]"
                    required
                  >
                    <option value="">-- Chọn môn --</option>
                    {subjectOptions.map((option) => (
                      <option key={option.slug} value={option.slug}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Chương *</label>
                    <input
                      type="text"
                      value={chapter}
                      onChange={(e) => setChapter(e.target.value)}
                      className="w-full px-4 py-2 bg-[#1a1a2d] border border-[#2f2f4a] rounded-lg text-white focus:outline-none focus:border-[#60a5fa]"
                    placeholder="VD: Chương 1, 1, Chương 2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nội dung Template</label>
                  <textarea
                    value={templateContent}
                    onChange={(e) => setTemplateContent(e.target.value)}
                    className="w-full px-4 py-2 bg-[#1a1a2d] border border-[#2f2f4a] rounded-lg text-white min-h-[300px] focus:outline-none focus:border-[#60a5fa]"
                    placeholder="Nhập nội dung template prompt (có thể để trống)"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400"
                  >
                    {loading ? 'Đang tạo...' : 'Tạo Template'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="border-[#2f2f4a] text-white"
                  >
                    Hủy
                  </Button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default CreateTemplatePage

