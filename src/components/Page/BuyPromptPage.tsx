import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HeaderHomepage from '@/components/Layout/HeaderHomepage'
import Footer from '@/components/Layout/Footer'
import SiderBar from '@/components/ProfileUser/SiderBar'
import { storageTemplateService, type StorageTemplate } from '@/services/storageTemplateService'
import { Button } from '@/components/ui/button'

const subjectDisplayMap: Record<string, string> = {
  math: 'Toán',
  physics: 'Vật lý',
  chemistry: 'Hóa học',
  biology: 'Sinh học',
  literature: 'Ngữ văn',
  history: 'Lịch sử',
  geography: 'Địa lý',
  english: 'Tiếng Anh',
  informatics: 'Tin học',
  technology: 'Công nghệ'
}

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
  const lower = label.trim().toLowerCase()
  const entry = Object.entries(subjectDisplayMap).find(([, display]) => display.toLowerCase() === lower)
  if (entry) return entry[0]
  const normalized = slugify(label)
  const normalizedEntry = Object.entries(subjectDisplayMap).find(([, display]) => slugify(display) === normalized)
  return normalizedEntry ? normalizedEntry[0] : normalized
}

const formatChapterDisplay = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return ''
  const digitMatch = trimmed.match(/\d+/)
  if (digitMatch) return `Chương ${digitMatch[0]}`
  if (/^chương\s*/i.test(trimmed)) {
    const replaced = trimmed.replace(/^chương\s*/i, 'Chương ')
    return replaced.charAt(0).toUpperCase() + replaced.slice(1)
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

const generateChapterSlug = (display: string) => {
  const digitMatch = display.match(/\d+/)
  if (digitMatch) return `chuong${digitMatch[0]}`
  return slugify(display)
}

type TemplateCard = {
  storageId: number
  templateName: string
  grade: string
  subject: string
  subjectSlug: string
  chapter: string
  chapterSlug: string
  description?: string
  previewUrl?: string | null
  createdAt?: string
}

const parseTemplate = (template: StorageTemplate): TemplateCard | null => {
  let parsed: any = {}
  try {
    parsed = template.templateContent ? JSON.parse(template.templateContent) : {}
  } catch {
    parsed = {}
  }

  const grade = template.grade || parsed.grade || ''
  const subject = template.subject || parsed.subject || ''
  const chapterRaw = template.chapter || parsed.chapter || ''
  const chapter = formatChapterDisplay(chapterRaw || parsed.chapterSlug || '')
  const subjectSlug = parsed.subjectSlug || resolveSubjectSlug(subject)
  const chapterSlug = parsed.chapterSlug || generateChapterSlug(chapter || chapterRaw)

  if (!grade || !subjectSlug || !chapterSlug) {
    return null
  }

  return {
    storageId: template.storageId,
    templateName: template.templateName,
    grade: grade.toString(),
    subject: subject || subjectDisplayMap[subjectSlug] || subjectSlug,
    subjectSlug,
    chapter: chapter || chapterRaw || 'Chương',
    chapterSlug,
    description: (template as any)?.templateDescription || parsed.description || parsed.content,
    previewUrl: (template as any)?.templatePreviewUrl || parsed.previewUrl,
    createdAt: template.createdAt || (template as any)?.uploadDate
  }
}

const BuyPromptPage: React.FC = () => {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<TemplateCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await storageTemplateService.getPublicTemplates({})
        const list = Array.isArray(response) ? (response as StorageTemplate[]) : (((response as any)?.data || []) as StorageTemplate[])
        const parsed = list
          .map((item) => parseTemplate(item))
          .filter((item): item is TemplateCard => Boolean(item))

        if (!ignore) setTemplates(parsed)
      } catch (err: any) {
        console.error('[BuyPrompt] Failed to load templates:', err)
        if (!ignore) setError(err?.response?.data?.message || 'Không thể tải danh sách template')
      } finally {
        if (!ignore) setLoading(false)
      }
    })()

    return () => {
      ignore = true
    }
  }, [])

  const sortedTemplates = useMemo(() => {
    return [...templates].sort((a, b) => {
      const gradeDiff = parseInt(a.grade) - parseInt(b.grade)
      if (gradeDiff !== 0) return gradeDiff
      const subjectDiff = a.subject.localeCompare(b.subject, 'vi')
      if (subjectDiff !== 0) return subjectDiff
      return a.chapter.localeCompare(b.chapter, 'vi', { numeric: true })
    })
  }, [templates])

  const handleViewTemplate = (card: TemplateCard) => {
    navigate(`/grade/${card.grade}/${card.subjectSlug}/detail/${card.chapterSlug}`)
  }

  return (
    <div className="min-h-screen bg-[#23233a] text-white flex flex-col">
      <HeaderHomepage />
      <div className="flex flex-1">
        <SiderBar />
        <main className="flex-1 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute top-[-10%] left-[12%] w-[420px] h-[420px] rounded-full bg-[#4f46e5]/40 blur-[180px]" />
            <div className="absolute bottom-[-18%] right-[5%] w-[560px] h-[560px] rounded-full bg-[#22d3ee]/30 blur-[220px]" />
            <div className="absolute top-[45%] left-[-10%] w-[380px] h-[380px] rounded-full bg-[#f472b6]/20 blur-[210px]" />
          </div>

          <div className="relative px-4 md:px-10 py-12">
            <div className="max-w-6xl mx-auto space-y-10">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs uppercase tracking-[0.35em] text-white/70">
                  Khám phá
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-[#c4d0ff] to-white bg-clip-text text-transparent">
                  Danh sách Template Prompt
                </h1>
                <p className="text-neutral-300 max-w-2xl mx-auto text-sm md:text-base">
                  Chọn template phù hợp để xem chi tiết hoặc thêm vào kho của bạn. Mỗi template đều được tối ưu cho từng khối và môn học cụ thể.
                </p>
              </div>

              {loading ? (
                <div className="text-center text-neutral-400 py-16 animate-pulse">Đang tải danh sách template...</div>
              ) : error ? (
                <div className="text-center text-red-400 py-16">{error}</div>
              ) : sortedTemplates.length === 0 ? (
                <div className="text-center text-neutral-400 py-16">Hiện chưa có template nào.</div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {sortedTemplates.map((item: TemplateCard, index: number) => (
                    <div
                      key={item.storageId}
                      className="group relative rounded-3xl border border-white/5 bg-white/[0.03] px-6 pt-7 pb-6 backdrop-blur-md overflow-hidden transition-transform duration-300 hover:-translate-y-1"
                      style={{ animationDelay: `${index * 70}ms` }}
                    >
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.08] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute -inset-[1px] rounded-3xl border border-transparent group-hover:border-indigo-400/70 transition-colors duration-300" />
                      <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] uppercase tracking-[0.32em] text-white/55">Template</span>
                          <span className="px-2 py-0.5 text-[11px] rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
                            #{String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <h2 className="text-xl font-semibold text-white line-clamp-2 min-h-[56px]">{item.templateName}</h2>
                        <div className="rounded-2xl bg-white/[0.04] border border-white/5 p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-neutral-200">
                            <div className="space-y-1">
                              <p className="text-xs uppercase tracking-wide text-white/40">Khối</p>
                              <p className="font-semibold text-white">{item.grade}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs uppercase tracking-wide text-white/40">Môn</p>
                              <p className="font-semibold text-white">{item.subject}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs uppercase tracking-wide text-white/40">Chương</p>
                              <p className="font-semibold text-white">{item.chapter}</p>
                            </div>
                            {item.createdAt && (
                              <div className="space-y-1">
                                <p className="text-xs uppercase tracking-wide text-white/40">Cập nhật</p>
                                <p className="font-semibold text-white">
                                  {new Date(item.createdAt).toLocaleDateString('vi-VN', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        {item.description && (
                          <p className="text-sm text-neutral-300 line-clamp-3">{item.description}</p>
                        )}
                        <Button
                          onClick={() => handleViewTemplate(item)}
                          className="w-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 hover:from-indigo-400 hover:via-sky-400 hover:to-cyan-300 transition-all duration-300 group-hover:scale-[1.02]"
                        >
                          Xem chi tiết
                        </Button>
                      </div>
                      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute -bottom-16 -right-12 w-56 h-56 bg-indigo-500/25 blur-[80px]" />
                        <div className="absolute -top-16 -left-12 w-44 h-44 bg-sky-500/20 blur-[70px]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default BuyPromptPage


