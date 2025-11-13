import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SiderBar from '@/components/ProfileUser/SiderBar'
import HeaderHomepage from '@/components/Layout/HeaderHomepage'
import HeaderGrade from '@/components/Layout/HeaderGrade'
import { storageTemplateService } from '@/services/storageTemplateService'

// Map key -> Vietnamese subject for display
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

const normalizeLoose = (value: string) => slugify(value).replace(/-/g, '')

const buildComparisonSet = (values: Array<string | null | undefined>) => {
  const set = new Set<string>()
  values
    .map((val) => val?.toString().trim())
    .filter(Boolean)
    .forEach((val) => {
      const lower = val!.toLowerCase()
      set.add(lower)
      set.add(slugify(val!))
      set.add(normalizeLoose(val!))
      if (lower.includes(' ')) set.add(lower.replace(/\s+/g, ''))
    })
  return set
}

const resolveSubjectSlug = (label: string) => {
  if (!label) return ''
  const lower = label.trim().toLowerCase()
  const entry = Object.entries(subjectDisplayMap).find(([, display]) => display.toLowerCase() === lower)
  if (entry) return entry[0]
  const normalized = slugify(label)
  const normalizedEntry = Object.entries(subjectDisplayMap).find(([, display]) => slugify(display) === normalized)
  return normalizedEntry ? normalizedEntry[0] : normalized
}

const DynamicSubjectChaptersPage: React.FC = () => {
  const { grade: gradeParam, subject = '' } = useParams<{ grade: string; subject: string }>()
  const navigate = useNavigate()
  const grade = gradeParam || '10'

  // Choose header by grade if needed
  const HeaderComponent = useMemo(() => {
    if (grade === '10') return HeaderGrade
    return HeaderHomepage
  }, [grade])

  const [chapters, setChapters] = useState<Array<{ key: string; title: string; count: number; latest?: string }>>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const handler = () => setRefreshKey((key) => key + 1)
    window.addEventListener('publicTemplatesUpdated', handler)
    return () => window.removeEventListener('publicTemplatesUpdated', handler)
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        type GradeUnion = '10' | '11' | '12'
        const gradeFilter: GradeUnion | undefined = (['10', '11', '12'] as GradeUnion[]).includes(grade as GradeUnion)
          ? (grade as GradeUnion)
          : undefined

        const subjectSlug = resolveSubjectSlug(subject)
        const subjectVi = subjectDisplayMap[subject] || subject

        const subjectComparison = buildComparisonSet([
          subject,
          subjectSlug,
          subjectVi,
          resolveSubjectSlug(subjectVi || ''),
          slugify(subjectVi || '')
        ])

        const filterTemplates = (source: any[]) => {
          return source.filter((t: any) => {
            const parsed = (() => {
              try {
                return JSON.parse(t.templateContent || '{}')
              } catch {
                return {}
              }
            })() as Record<string, any>

            const tGrade = t.grade ?? parsed.grade

            const candidateSubjects = [
              t.subject,
              parsed.subject,
              resolveSubjectSlug(t.subject || ''),
              resolveSubjectSlug(parsed.subject || ''),
              parsed.subjectSlug
            ]

            const subjectMatches = candidateSubjects.some((val) => {
              if (!val) return false
              const lower = val.toString().toLowerCase()
              return (
                subjectComparison.has(lower) ||
                subjectComparison.has(slugify(val)) ||
                subjectComparison.has(normalizeLoose(val))
              )
            })

            const gradeMatches = !gradeFilter || (tGrade && tGrade.toString() === gradeFilter.toString())

            return gradeMatches && subjectMatches
          })
        }

        let filteredList: any[] = []

        try {
          const response = await storageTemplateService.getPublicTemplates({
            grade: gradeFilter,
            subject: subjectVi
          })
          const list = Array.isArray(response) ? response : (response as any)?.data || []
          filteredList = filterTemplates(list)
          console.log('[Chapters] Loaded public templates with subject name:', filteredList.length)
        } catch (err) {
          console.warn('[Chapters] Failed to load public templates with subject name', subjectVi, err)
        }

        if (filteredList.length === 0 && subjectSlug) {
          try {
            const response = await storageTemplateService.getPublicTemplates({
              grade: gradeFilter,
              subject: subjectSlug
            })
            const list = Array.isArray(response) ? response : (response as any)?.data || []
            filteredList = filterTemplates(list)
            console.log('[Chapters] Loaded public templates with subject slug:', filteredList.length)
          } catch (err) {
            console.warn('[Chapters] Failed to load public templates with subject slug', subjectSlug, err)
          }
        }

        if (filteredList.length === 0) {
          try {
            const response = await storageTemplateService.getPublicTemplates({ grade: gradeFilter })
            const list = Array.isArray(response) ? response : (response as any)?.data || []
            filteredList = filterTemplates(list)
            console.log('[Chapters] Loaded templates via grade fallback:', filteredList.length)
          } catch (err) {
            console.warn('[Chapters] Fallback load all public templates failed:', err)
          }
        }

        const unique = new Map<string, { title: string; count: number; latest?: string }>()
        filteredList.forEach((t: any) => {
          const ch: string = t.chapter || (() => {
            try {
              const c = JSON.parse(t.templateContent || '{}')
              return c.chapter || ''
            } catch { return '' }
          })()
          if (!ch) return
          // Normalize to chuongX key
          const m = /\d+/.exec(ch)
          const num = m ? m[0] : ''
          const key = num ? `chuong${num}` : ch.toLowerCase().replace(/\s+/g, '-')
          const createdAt = t.createdAt || t.created_date
          if (!unique.has(key)) unique.set(key, { title: ch, count: 1, latest: createdAt })
          else {
            const cur = unique.get(key)!
            cur.count += 1
            if (createdAt && (!cur.latest || new Date(createdAt) > new Date(cur.latest))) cur.latest = createdAt
          }
        })
        if (!mounted) return
        const items = Array.from(unique.entries()).map(([key, v]) => ({ key, title: v.title, count: v.count, latest: v.latest }))
        // Sort by numeric chapter if possible
        items.sort((a, b) => (parseInt(a.key.replace('chuong', '')) || 0) - (parseInt(b.key.replace('chuong', '')) || 0))
        setChapters(items)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [grade, subject, refreshKey])

  const subjectVi = subjectDisplayMap[subject] || subject

  return (
    <div className="min-h-screen bg-[#1a1a2d] text-white">
      <HeaderComponent />
      <div className="flex">
        <SiderBar />
        <main className="flex-1 p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-3xl md:text-4xl font-bold">{subjectVi} khối {grade}</h2>
              <p className="text-neutral-400 mt-1">Chọn chương để xem chi tiết template</p>
            </div>

            {loading ? (
              <div className="text-center text-neutral-400 py-10">Đang tải danh sách chương...</div>
            ) : chapters.length === 0 ? (
              <div className="text-center text-neutral-400 py-10">Chưa có chương nào cho {subjectVi} khối {grade}.</div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {chapters.map((ch, index) => (
                  <button
                    key={ch.key}
                    onClick={() => navigate(`/grade/${grade}/${subject}/detail/${ch.key}`)}
                    className="group relative bg-[#1a1a2d] rounded-2xl border border-[#2a2a44] hover:border-[#3a3a54] transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden w-full text-left"
                    style={{ animationDelay: `${index * 0.06}s` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300" />
                    <div className="relative z-10 p-6 space-y-3">
                      {/* Header row: Badge and chapter title */}
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">Chương</span>
                        <span className="text-xs text-neutral-400">{ch.count} template</span>
                      </div>
                      <h3 className="text-2xl font-bold">{ch.title}</h3>
                      {/* Details like package card */}
                      <div className="text-sm text-neutral-300 grid grid-cols-2 gap-x-4 gap-y-1">
                        <div className="opacity-80">Khối</div><div className="text-right font-medium">{grade}</div>
                        <div className="opacity-80">Môn</div><div className="text-right font-medium">{subjectVi}</div>
                        {ch.latest && (<><div className="opacity-80">Cập nhật</div><div className="text-right font-medium">{new Date(ch.latest).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          timeZone: 'Asia/Ho_Chi_Minh'
                        })}</div></>)}
                      </div>
                      <div className="pt-2">
                        <span className="inline-block text-[13px] text-neutral-400">Nhấn để xem chi tiết</span>
                      </div>
                    </div>
                    <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-md" />
                    <div className="pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-60 transition-all duration-300 -z-10 blur-xl" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DynamicSubjectChaptersPage


