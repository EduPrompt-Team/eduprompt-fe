import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HeaderHomepage from '@/components/Layout/HeaderHomepage'
import SiderBar from '@/components/ProfileUser/SiderBar'
import { storageTemplateService, type StorageTemplate } from '@/services/storageTemplateService'
import { getCurrentUser } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { Edit, Trash2, Eye, Plus } from 'lucide-react'

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

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

const subjectSlugMap = subjectOptions.reduce<Record<string, string>>((acc, option) => {
  const lowerLabel = option.label.toLowerCase()
  acc[lowerLabel] = option.slug
  acc[slugify(option.label)] = option.slug
  return acc
}, {})

const resolveSubjectSlug = (value: string) => {
  const trimmed = (value || '').trim()
  if (!trimmed) return ''
  const lower = trimmed.toLowerCase()
  const directOption = subjectOptions.find((option) => option.slug === lower)
  if (directOption) return directOption.slug
  const normalized = slugify(trimmed)
  const mapped = subjectSlugMap[lower] || subjectSlugMap[normalized]
  if (mapped) return mapped
  const optionByNormalized = subjectOptions.find((option) => slugify(option.label) === normalized)
  return optionByNormalized?.slug || normalized
}

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
  createdBy,
  createdAt
}: {
  grade: string
  subject: string
  chapter: string
  chapterSlug: string
  subjectSlug: string
  content: string
  createdBy?: string
  createdAt?: string
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
      createdAt: createdAt || new Date().toISOString()
    },
    null,
    2
  )
}

const parseTemplateContent = (raw?: string | null) => {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

const MyTemplatesPage: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
const [templates, setTemplates] = useState<StorageTemplate[]>([])
const [publicTemplates, setPublicTemplates] = useState<StorageTemplate[]>([])
  const publishTemplate = async (storageId: number) => {
    try {
      await storageTemplateService.publishTemplate(storageId)
      showToast('Template đã được public và hiển thị cho mọi người.', 'success')
      return true
    } catch (error: any) {
      console.warn('[MyTemplates] Failed to publish template:', error)
      showToast(
        error?.response?.data?.message ||
          'Không thể public template ngay lúc này. Template vẫn ở trong Kho cá nhân của bạn.',
        'warning'
      )
      return false
    }
  }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
const [editForm, setEditForm] = useState({
  templateName: '',
  templateContent: '',
  grade: '' as '10' | '11' | '12' | '',
  subjectSlug: '',
  chapter: ''
})

  useEffect(() => {
    fetchTemplates()
    fetchPublicTemplates()
  }, [])

  useEffect(() => {
    const handler = () => {
      fetchTemplates()
      fetchPublicTemplates()
    }
    window.addEventListener('publicTemplatesUpdated', handler)
    return () => window.removeEventListener('publicTemplatesUpdated', handler)
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      const currentUser = getCurrentUser()
      if (!currentUser?.userId) {
        setError('Vui lòng đăng nhập')
        setTemplates([])
        return
      }

      const data = await storageTemplateService.getMyStorage()
      const allTemplates = Array.isArray(data) ? data : []
      
      // Filter chỉ lấy templates của user hiện tại
      const userTemplates = allTemplates.filter(
        (template: StorageTemplate) => template.userId === Number(currentUser.userId)
      )
      
      setTemplates(userTemplates)
    } catch (err: any) {
      console.error('Failed to load templates:', err)
      setError(err?.response?.data?.message || 'Không thể tải danh sách templates')
      showToast('Không thể tải danh sách templates', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchPublicTemplates = async () => {
    try {
      const list = await storageTemplateService.getPublicTemplates({}).catch(() => [])
      setPublicTemplates(Array.isArray(list) ? list : [])
    } catch (err) {
      console.warn('Failed to load public templates:', err)
    }
  }

  const handleDelete = async (templateId: number) => {
    const currentUser = getCurrentUser()
    if (!currentUser?.userId) {
      showToast('Vui lòng đăng nhập', 'error')
      return
    }

    // Kiểm tra template có thuộc về user hiện tại không
    const template = templates.find(t => t.storageId === templateId)
    if (!template) {
      showToast('Không tìm thấy template', 'error')
      return
    }

    if (template.userId !== Number(currentUser.userId)) {
      showToast('Bạn không có quyền xóa template này', 'error')
      return
    }

    if (!window.confirm('Bạn có chắc chắn muốn xóa template này không?')) {
      return
    }

    try {
      setDeletingId(templateId)
      await storageTemplateService.deleteTemplate(templateId)
      showToast('Đã xóa template thành công!', 'success')
      fetchTemplates()
      fetchPublicTemplates()
      window.dispatchEvent(new CustomEvent('publicTemplatesUpdated', { detail: { templateId, action: 'delete' } }))
    } catch (err: any) {
      console.error('Failed to delete template:', err)
      showToast(err?.response?.data?.message || 'Không thể xóa template', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (template: StorageTemplate) => {
    const currentUser = getCurrentUser()
    if (!currentUser?.userId) {
      showToast('Vui lòng đăng nhập', 'error')
      return
    }

    // Kiểm tra template có thuộc về user hiện tại không
    if (template.userId !== Number(currentUser.userId)) {
      showToast('Bạn không có quyền sửa template này', 'error')
      return
    }

    const parsed = parseTemplateContent(template.templateContent)
    const gradeValue = (parsed?.grade || template.grade || '') as '10' | '11' | '12' | ''
    const subjectLabel = parsed?.subject || template.subject || ''
    const subjectSlugValue = resolveSubjectSlug(parsed?.subjectSlug || subjectLabel)
    const chapterValue = parsed?.chapter || template.chapter || ''

    setEditingId(template.storageId)
    setEditForm({
      templateName: template.templateName,
      templateContent: parsed?.content || template.templateContent || '',
      grade: gradeValue,
      subjectSlug: subjectSlugValue,
      chapter: chapterValue
    })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({
      templateName: '',
      templateContent: '',
      grade: '',
      subjectSlug: '',
      chapter: ''
    })
  }

  const handleSaveEdit = async (templateId: number) => {
    const currentUser = getCurrentUser()
    if (!currentUser?.userId) {
      showToast('Vui lòng đăng nhập', 'error')
      return
    }

    // Kiểm tra template có thuộc về user hiện tại không
    const template = templates.find(t => t.storageId === templateId)
    if (!template) {
      showToast('Không tìm thấy template', 'error')
      return
    }

    if (template.userId !== Number(currentUser.userId)) {
      showToast('Bạn không có quyền sửa template này', 'error')
      setEditingId(null)
      return
    }

    const gradeValue = (editForm.grade || template.grade || '').trim()
    const chapterDisplay = formatChapterDisplay(editForm.chapter || template.chapter || '')
    const parsed = parseTemplateContent(template.templateContent)
    const subjectSlugValue = resolveSubjectSlug(
      editForm.subjectSlug ||
      parsed?.subjectSlug ||
      parsed?.subject ||
      template.subject ||
      ''
    )
    const subjectName =
      subjectLabelMap[subjectSlugValue] ||
      (parsed?.subject || template.subject || '').trim()

    if (!gradeValue) {
      showToast('Vui lòng nhập khối hợp lệ', 'warning')
      return
    }

    const allowedGrades: Array<'10' | '11' | '12'> = ['10', '11', '12']
    if (!allowedGrades.includes(gradeValue as '10' | '11' | '12')) {
      showToast('Khối phải là 10, 11 hoặc 12', 'warning')
      return
    }
    const gradeTyped = gradeValue as '10' | '11' | '12'

    if (!subjectSlugValue || !subjectName) {
      showToast('Vui lòng nhập môn hợp lệ', 'warning')
      return
    }

    if (!chapterDisplay) {
      showToast('Vui lòng nhập chương hợp lệ', 'warning')
      return
    }

    const chapterSlug = generateChapterSlug(chapterDisplay)
    const metadataContent = buildTemplateContent({
      grade: gradeTyped,
      subject: subjectName,
      chapter: chapterDisplay,
      chapterSlug,
      subjectSlug: subjectSlugValue,
      content: editForm.templateContent.trim(),
      createdBy: currentUser?.fullName || currentUser?.email || undefined,
      createdAt: template.createdAt
    })

    try {
      await storageTemplateService.updateTemplate(templateId, {
        templateName: editForm.templateName.trim(),
        templateContent: metadataContent,
        grade: gradeTyped,
        subject: subjectName,
        chapter: chapterDisplay
      })
      await publishTemplate(templateId)
      showToast('Đã cập nhật template thành công!', 'success')
      setEditingId(null)
      fetchTemplates()
      fetchPublicTemplates()
      window.dispatchEvent(new CustomEvent('publicTemplatesUpdated', { detail: { templateId, action: 'update' } }))
    } catch (err: any) {
      console.error('Failed to update template:', err)
      showToast(err?.response?.data?.message || 'Không thể cập nhật template', 'error')
    }
  }

  const resolveRouteFromMetadata = (metadata: StorageTemplate | null | undefined) => {
    if (!metadata) return null
    const parsed = parseTemplateContent(metadata.templateContent)
    const routePath = (parsed?.route as string | undefined)?.trim()
    const gradeValue = metadata.grade || parsed?.grade
    const subjectLabel = parsed?.subject || metadata.subject || ''
    const subjectSlugValue = parsed?.subjectSlug || resolveSubjectSlug(subjectLabel)
    const chapterDisplay = parsed?.chapter || metadata.chapter
    const chapterSlugValue =
      parsed?.chapterSlug || (chapterDisplay ? generateChapterSlug(chapterDisplay) : '')

    if (routePath && gradeValue && subjectSlugValue && chapterSlugValue) {
      return routePath
    }

    if (gradeValue && subjectSlugValue && chapterSlugValue) {
      return `/grade/${gradeValue}/${subjectSlugValue}/detail/${chapterSlugValue}`
    }

    return null
  }

  const handleViewTemplate = (template: StorageTemplate) => {
    let finalRoute = resolveRouteFromMetadata(template)

    if (!finalRoute) {
      const parsed = parseTemplateContent(template.templateContent)
      const subjectLabel = parsed?.subject || template.subject || ''
      const subjectSlugValue = parsed?.subjectSlug || resolveSubjectSlug(subjectLabel)
      const matchingPublic = publicTemplates.find(
        (tpl) =>
          tpl.templateName === template.templateName &&
          tpl.packageId === template.packageId &&
          (tpl.subject === subjectLabel || resolveSubjectSlug(tpl.subject || '') === subjectSlugValue)
      )
      finalRoute = resolveRouteFromMetadata(matchingPublic)
    }

    if (!finalRoute) {
      showToast('Template chưa có đủ thông tin để xem', 'warning')
      return
    }

    navigate(finalRoute)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <HeaderHomepage />
      <div className="flex">
        <SiderBar />
        <main className="flex-1 bg-[#23233a] text-white min-h-[calc(100vh-4rem)] px-0">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Quản lý Template</h1>
                <p className="text-neutral-400">Quản lý các template prompt bạn đã tạo</p>
              </div>
              <Button
                onClick={() => navigate('/Sell')}
                className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tạo Template mới
              </Button>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 text-red-400">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="text-neutral-400">Đang tải danh sách templates...</div>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-neutral-400 text-lg mb-4">Bạn chưa tạo template nào</p>
                <Button
                  onClick={() => navigate('/Sell')}
                  className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo Template đầu tiên
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {templates.map((template) => (
                  <div
                    key={template.storageId}
                    className="bg-[#1a1a2d] border border-[#2f2f4a] rounded-lg p-6 hover:border-[#3a3a54] transition-colors"
                  >
                    {editingId === template.storageId ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Tên Template *</label>
                          <input
                            type="text"
                            value={editForm.templateName}
                            onChange={(e) => setEditForm({ ...editForm, templateName: e.target.value })}
                            className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2f2f4a] rounded-lg text-white focus:outline-none focus:border-[#60a5fa]"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Khối</label>
                            <select
                              value={editForm.grade}
                              onChange={(e) => setEditForm({ ...editForm, grade: e.target.value as '10' | '11' | '12' | '' })}
                              className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2f2f4a] rounded-lg text-white focus:outline-none focus:border-[#60a5fa]"
                            >
                              <option value="">-- Chọn khối --</option>
                              <option value="10">Lớp 10</option>
                              <option value="11">Lớp 11</option>
                              <option value="12">Lớp 12</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Môn</label>
                            <select
                              value={editForm.subjectSlug}
                              onChange={(e) => setEditForm({ ...editForm, subjectSlug: e.target.value })}
                              className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2f2f4a] rounded-lg text-white focus:outline-none focus:border-[#60a5fa]"
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
                            <label className="block text-sm font-medium mb-2">Chương</label>
                            <input
                              type="text"
                              value={editForm.chapter}
                              onChange={(e) => setEditForm({ ...editForm, chapter: e.target.value })}
                              className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2f2f4a] rounded-lg text-white focus:outline-none focus:border-[#60a5fa]"
                              placeholder="VD: Chương 1, 1, Chương 2"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Nội dung Template</label>
                          <textarea
                            value={editForm.templateContent}
                            onChange={(e) => setEditForm({ ...editForm, templateContent: e.target.value })}
                            className="w-full px-4 py-2 bg-[#0a0a0f] border border-[#2f2f4a] rounded-lg text-white min-h-[200px] focus:outline-none focus:border-[#60a5fa]"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleSaveEdit(template.storageId)}
                            className="bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400"
                          >
                            Lưu
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="outline"
                            className="border-[#2f2f4a] text-white"
                          >
                            Hủy
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {(() => {
                          const parsed = parseTemplateContent(template.templateContent)
                          const displayGrade = template.grade || parsed?.grade
                          const displaySubjectRaw = template.subject || parsed?.subject || ''
                          const subjectSlugValue = parsed?.subjectSlug || resolveSubjectSlug(displaySubjectRaw)
                          const displaySubject =
                            displaySubjectRaw ||
                            subjectLabelMap[subjectSlugValue] ||
                            subjectOptions.find((option) => option.slug === subjectSlugValue)?.label ||
                            ''
                          const displayChapter = template.chapter || parsed?.chapter
                          const displayContent = parsed?.content || template.templateContent
                          const rawRoute = (parsed?.route as string | undefined)?.trim()
                          const fallbackRoute =
                            displayGrade && subjectSlugValue && displayChapter
                              ? `/grade/${displayGrade}/${subjectSlugValue}/detail/${generateChapterSlug(displayChapter)}`
                              : ''
                          const computedRoute = fallbackRoute || rawRoute || ''
                          return (
                            <>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">{template.templateName}</h3>
                            <div className="flex flex-wrap gap-2 text-sm text-neutral-400">
                              {displayGrade && <span>Lớp {displayGrade}</span>}
                              {displaySubject && <span>• {displaySubject}</span>}
                              {displayChapter && <span>• {displayChapter}</span>}
                            </div>
                            {displayContent && (
                              <p className="text-neutral-300 mt-2 line-clamp-2">
                                {displayContent}
                              </p>
                            )}
                            {computedRoute && (
                              <button
                                type="button"
                                onClick={() => navigate(computedRoute)}
                                className="text-xs text-blue-400 hover:text-blue-300 underline mt-1 break-all"
                              >
                                {computedRoute}
                              </button>
                            )}
                            <p className="text-xs text-neutral-500 mt-2">
                              Tạo lúc: {new Date(template.createdAt).toLocaleString('vi-VN')}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              onClick={() => handleViewTemplate(template)}
                              variant="outline"
                              size="sm"
                              className="border-[#2f2f4a] text-white"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleEdit(template)}
                              variant="outline"
                              size="sm"
                              className="border-[#2f2f4a] text-white"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(template.storageId)}
                              variant="outline"
                              size="sm"
                              disabled={deletingId === template.storageId}
                              className="border-red-500 text-red-400 hover:bg-red-500/20"
                            >
                              {deletingId === template.storageId ? (
                                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                            </>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default MyTemplatesPage

