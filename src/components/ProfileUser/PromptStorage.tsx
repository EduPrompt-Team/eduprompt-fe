import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { storageTemplateService } from '@/services/storageTemplateService'
import { promptInstanceService } from '@/services/promptInstanceService'
import { getCurrentUser } from '@/lib/api'
import { Heart, Download, MessageCircle, History } from 'lucide-react'
import type { StorageTemplate } from '@/services/storageTemplateService'
import type { PromptInstanceDto } from '@/types/dto/prompt'

const PromptStorage: React.FC = () => {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<StorageTemplate[]>([])
  const [instances, setInstances] = useState<PromptInstanceDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const defaultImage = new URL('../../assets/Image/Toan10.png', import.meta.url).href

  useEffect(() => {
    let isMounted = true

    async function loadMyStorage() {
      try {
        setLoading(true)
        setError(null)
        const data = await storageTemplateService.getMyStorage()
        if (isMounted) {
          console.log('[PromptStorage] Loaded templates:', Array.isArray(data) ? data.length : 0)
          setTemplates(Array.isArray(data) ? data : [])
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('[PromptStorage] Failed to load storage:', err)
          setError(err?.response?.data?.message || 'Không thể tải kho prompt')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    async function loadInstances() {
      try {
        const currentUser = getCurrentUser()
        console.log('[PromptStorage] Loading instances for userId:', currentUser?.userId)
        if (currentUser?.userId) {
          const userInstances = await promptInstanceService.getByUser(Number(currentUser.userId))
          console.log('[PromptStorage] Raw API response:', {
            isArray: Array.isArray(userInstances),
            length: Array.isArray(userInstances) ? userInstances.length : 0,
            rawData: userInstances
          })
          
          if (isMounted) {
            // Log tất cả instances trước khi filter
            if (Array.isArray(userInstances) && userInstances.length > 0) {
              console.log('[PromptStorage] All instances (before filter):', userInstances.map(inst => ({
                instanceId: inst.instanceId,
                userId: inst.userId,
                packageId: inst.packageId,
                storageId: inst.storageId,
                status: inst.status,
                hasOutputJson: !!inst.outputJson,
                outputJsonLength: inst.outputJson?.length || 0,
                promptName: inst.promptName,
                executedAt: inst.executedAt
              })))
            }
            
            // Filter chỉ lấy instances đã hoàn thành (có outputJson)
            const completedInstances = Array.isArray(userInstances) 
              ? userInstances.filter(inst => inst.outputJson != null)
              : []
            console.log('[PromptStorage] Loaded instances:', completedInstances.length, 'completed out of', Array.isArray(userInstances) ? userInstances.length : 0, 'total')
            console.log('[PromptStorage] Instances details:', completedInstances.map(inst => ({
              instanceId: inst.instanceId,
              packageId: inst.packageId,
              storageId: inst.storageId,
              promptName: inst.promptName,
              hasOutput: !!inst.outputJson,
              executedAt: inst.executedAt
            })))
            setInstances(completedInstances)
          }
        } else {
          console.warn('[PromptStorage] No currentUser or userId found')
        }
      } catch (err: any) {
        console.error('[PromptStorage] Failed to load instances:', err)
        console.error('[PromptStorage] Error details:', {
          message: err?.message,
          response: err?.response?.data,
          status: err?.response?.status
        })
        if (isMounted) {
          setInstances([])
        }
      }
    }

    loadMyStorage()
    loadInstances()
    
    // Listen for storage update events
    const handleStorageUpdate = () => {
      console.log('[PromptStorage] Storage updated, reloading...')
      loadMyStorage()
      loadInstances()
    }
    
    // Listen for chat history update events
    const handleChatHistoryUpdate = () => {
      console.log('[PromptStorage] Chat history updated, reloading instances...')
      loadInstances()
      // Reload instancesByStorage nếu có templates
      if (templates.length > 0) {
        // Trigger reload của instancesByStorage
        setInstancesByStorage(new Map())
      }
    }
    
    window.addEventListener('storageUpdated', handleStorageUpdate)
    window.addEventListener('chatHistoryUpdated', handleChatHistoryUpdate)
    
    return () => {
      isMounted = false
      window.removeEventListener('storageUpdated', handleStorageUpdate)
      window.removeEventListener('chatHistoryUpdated', handleChatHistoryUpdate)
    }
  }, [])

  const handleViewPrompt = (template: StorageTemplate, e?: React.MouseEvent) => {
    // Prevent event bubbling nếu có
    if (e) {
      e.stopPropagation()
    }
    
    // Navigate to form page based on grade, subject, chapter
    const grade = template.grade || '10'
    const subjectVi = template.subject || 'Toán'
    const chapter = template.chapter || 'Chương 1'
    
    // Map Vietnamese subject name to English key for URL
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
    const subject = subjectMap[subjectVi] || subjectVi.toLowerCase().replace(/\s+/g, '-')
    
    // Extract chapter number (e.g., "Chương 1" -> "chuong1")
    const chapterMatch = chapter.match(/\d+/)
    const chapterNum = chapterMatch ? chapterMatch[0] : '1'
    const chapterSlug = `chuong${chapterNum}`
    
    // Navigate to form page với template data
    navigate(`/grade${grade}/${subject}/detail/${chapterSlug}/form`, {
      state: { template }
    })
  }
  
  const handleTemplateClick = (template: StorageTemplate) => {
    // Navigate to detail page based on grade, subject, chapter
    const grade = template.grade || '10'
    const subjectVi = template.subject || 'Toán'
    const chapter = template.chapter || 'Chương 1'
    
    // Map Vietnamese subject name to English key for URL
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
    const subject = subjectMap[subjectVi] || subjectVi.toLowerCase().replace(/\s+/g, '-')
    
    // Extract chapter number (e.g., "Chương 1" -> "chuong1")
    const chapterMatch = chapter.match(/\d+/)
    const chapterNum = chapterMatch ? chapterMatch[0] : '1'
    const chapterSlug = `chuong${chapterNum}`
    
    navigate(`/grade${grade}/${subject}/detail/${chapterSlug}`)
  }

  const handleGoToChat = (template: StorageTemplate, instance: PromptInstanceDto, e?: React.MouseEvent) => {
    // Prevent event bubbling
    if (e) {
      e.stopPropagation()
    }
    
    // Navigate to chat page based on grade, subject, chapter
    const grade = template.grade || '10'
    const subjectVi = template.subject || 'Toán'
    const chapter = template.chapter || 'Chương 1'
    
    // Map Vietnamese subject name to English key for URL
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
    const subject = subjectMap[subjectVi] || subjectVi.toLowerCase().replace(/\s+/g, '-')
    
    // Extract chapter number (e.g., "Chương 1" -> "chuong1")
    const chapterMatch = chapter.match(/\d+/)
    const chapterNum = chapterMatch ? chapterMatch[0] : '1'
    const chapterSlug = `chuong${chapterNum}`
    
    // Navigate to chat page với instance data để restore conversation
    navigate(`/grade${grade}/${subject}/detail/${chapterSlug}/chat`, {
      state: { 
        template,
        instance,
        restoreChat: true
      }
    })
  }

  const handleViewChatHistory = (template: StorageTemplate, e?: React.MouseEvent) => {
    // Prevent event bubbling
    if (e) {
      e.stopPropagation()
    }
    
    // Navigate to chat history page based on grade, subject, chapter
    const grade = template.grade || '10'
    const subjectVi = template.subject || 'Toán'
    const chapter = template.chapter || 'Chương 1'
    
    // Map Vietnamese subject name to English key for URL
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
    const subject = subjectMap[subjectVi] || subjectVi.toLowerCase().replace(/\s+/g, '-')
    
    // Extract chapter number (e.g., "Chương 1" -> "chuong1")
    const chapterMatch = chapter.match(/\d+/)
    const chapterNum = chapterMatch ? chapterMatch[0] : '1'
    const chapterSlug = `chuong${chapterNum}`
    
    // Navigate to chat history page với template data
    navigate(`/grade${grade}/${subject}/detail/${chapterSlug}/chat-history`, {
      state: { template }
    })
  }
  
  // Helper function to check if template has any chat history
  const hasChatHistory = (template: StorageTemplate): boolean => {
    // Check instancesByStorage first (endpoint mới /storage/{storageId})
    if (template.storageId && template.storageId > 0) {
      const storageInstances = instancesByStorage.get(template.storageId)
      if (storageInstances && storageInstances.length > 0) {
        return true
      }
    }
    
    // Fallback: Check instances list (từ user instances)
    // Match theo packageId (handle null case)
    // BE đã fix: GetByUserIdAsync giờ trả về tất cả instances, bao gồm cả completed
    const hasInstance = instances.some(
      (inst) => {
        // Match packageId (cả hai phải không null và bằng nhau)
        if (inst.packageId != null && template.packageId != null) {
          return inst.packageId === template.packageId && inst.outputJson != null
        }
        // Nếu một trong hai null, không match
        return false
      }
    )
    return hasInstance
  }

  // State để lưu instances theo storageId (map storageId -> instances[])
  const [instancesByStorage, setInstancesByStorage] = useState<Map<number, PromptInstanceDto[]>>(new Map())
  
  // Load instances theo storageId cho mỗi template
  useEffect(() => {
    if (templates.length === 0) return
    
    let isMounted = true
    
    async function loadInstancesByStorage() {
      const instancesMap = new Map<number, PromptInstanceDto[]>()
      
      // Load instances cho mỗi template bằng endpoint mới /storage/{storageId}
      await Promise.all(
        templates.map(async (template) => {
          if (template.storageId && template.storageId > 0) {
            try {
              // Sử dụng endpoint mới /storage/{storageId}/my để lấy instances của user hiện tại
              // BE đã fix: Endpoint này filter theo UserId từ JWT token
              const storageInstances = await promptInstanceService.getMyInstancesByStorageId(template.storageId)
              if (isMounted && Array.isArray(storageInstances)) {
                // Chỉ lấy instances đã hoàn thành (có outputJson)
                const completedInstances = storageInstances.filter(inst => inst.outputJson != null)
                if (completedInstances.length > 0) {
                  instancesMap.set(template.storageId, completedInstances)
                }
              }
            } catch (err: any) {
              // Handle 404 gracefully - có thể không có instances cho storageId này
              if (err?.response?.status !== 404) {
                console.warn(`[PromptStorage] Failed to load instances for storageId ${template.storageId}:`, err)
              } else {
                // 404 có thể là không có instances - không cần log warning
                console.log(`[PromptStorage] No instances found for storageId ${template.storageId} (404)`)
              }
            }
          }
        })
      )
      
      if (isMounted) {
        setInstancesByStorage(instancesMap)
        console.log('[PromptStorage] InstancesByStorage loaded:', instancesMap.size, 'templates with instances')
      }
    }
    
    loadInstancesByStorage()
    
    return () => {
      isMounted = false
    }
  }, [templates])
  
  // Reload instances và instancesByStorage khi có chat history update event
  useEffect(() => {
    const handleChatHistoryUpdate = (event: any) => {
      const { instanceId, packageId, storageId, userId } = event.detail || {}
      console.log('[PromptStorage] Chat history updated event received:', { instanceId, packageId, storageId, userId })
      console.log('[PromptStorage] Reloading instances after chat save...')
      
      // Delay một chút để đảm bảo BE đã commit transaction
      setTimeout(() => {
        // Reload cả instances list (từ getByUser) và instancesByStorage
        const currentUser = getCurrentUser()
        console.log('[PromptStorage] Current user for reload:', currentUser?.userId)
        
        if (currentUser?.userId) {
          // Reload instances list với logging chi tiết
          promptInstanceService.getByUser(Number(currentUser.userId))
            .then((userInstances) => {
              console.log('[PromptStorage] Reload - Raw API response:', {
                isArray: Array.isArray(userInstances),
                length: Array.isArray(userInstances) ? userInstances.length : 0
              })
              
              if (Array.isArray(userInstances) && userInstances.length > 0) {
                console.log('[PromptStorage] Reload - All instances:', userInstances.map(inst => ({
                  instanceId: inst.instanceId,
                  userId: inst.userId,
                  packageId: inst.packageId,
                  hasOutputJson: !!inst.outputJson,
                  status: inst.status
                })))
              }
              
              const completedInstances = Array.isArray(userInstances) 
                ? userInstances.filter(inst => inst.outputJson != null)
                : []
              setInstances(completedInstances)
              console.log('[PromptStorage] Reloaded instances:', completedInstances.length, 'completed')
            })
            .catch((err) => {
              console.error('[PromptStorage] Failed to reload instances:', err)
            })
        }
        
        // Reload instancesByStorage bằng cách reset và reload
        if (templates.length > 0) {
          setInstancesByStorage(new Map())
          // Reload sẽ được trigger bởi dependency [templates] trong useEffect loadInstancesByStorage
        }
      }, 500) // Delay 500ms để đảm bảo BE đã commit
    }
    
    window.addEventListener('chatHistoryUpdated', handleChatHistoryUpdate)
    
    return () => {
      window.removeEventListener('chatHistoryUpdated', handleChatHistoryUpdate)
    }
  }, [templates])
  
  // Helper function to find instance for a template
  const getInstanceForTemplate = (template: StorageTemplate): PromptInstanceDto | null => {
    // Ưu tiên 1: Tìm từ instancesByStorage (endpoint mới /storage/{storageId})
    if (template.storageId && template.storageId > 0) {
      const storageInstances = instancesByStorage.get(template.storageId)
      if (storageInstances && storageInstances.length > 0) {
        // Lấy instance mới nhất (có outputJson đã được filter ở trên)
        return storageInstances[0]
      }
    }
    
    // Fallback: Tìm từ instances list (theo packageId) - backward compatibility
    // Tìm tất cả instances matching và lấy mới nhất
    const matchingInstances = instances.filter(
      (inst) => {
        // Match theo packageId (handle null case)
        // BE đã fix: PackageId có thể null, và được convert từ 0 (entity) -> NULL (DB)
        if (inst.packageId != null && template.packageId != null) {
          // Exact match
          if (inst.packageId === template.packageId && inst.outputJson != null) {
            return true
          }
        }
        // Nếu cả hai đều null, không match (cần có packageId để link)
        return false
      }
    )
    
    if (matchingInstances.length > 0) {
      // Sort by executedAt (newest first) và lấy instance mới nhất
      matchingInstances.sort((a, b) => 
        new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime()
      )
      return matchingInstances[0]
    }
    
    return null
  }

  return (
    <div className="py-8 px-10">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold">Kho Prompt</h1>
        <p className="text-neutral-400 mt-1">Quản lý và xem lại các prompt đã lưu</p>
        <div className="mt-4 h-0.5 -mx-10 bg-white"></div>

      {/* Loading State */}
      {loading && (
        <div className="mt-6 text-center text-neutral-400">
          Đang tải kho prompt...
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="mt-6 text-center text-red-400">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && templates.length === 0 && (
        <div className="mt-6 text-center py-12">
          <p className="text-neutral-400 text-lg mb-4">Chưa có prompt nào trong kho</p>
          <p className="text-neutral-500 text-sm">Hãy thêm prompt vào kho từ trang chi tiết prompt</p>
        </div>
      )}

      {/* Templates Grid */}
      {!loading && !error && templates.length > 0 && (
        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template) => {
            const subject = template.subject || 'Toán'
            const chapter = template.chapter || 'Chương 1'
            const instance = getInstanceForTemplate(template)
            const hasChat = instance != null
            const hasHistory = hasChatHistory(template)
            
            // Debug logging
            if (hasHistory || hasChat) {
              console.log('[PromptStorage] Template has chat history:', {
                templateName: template.templateName,
                storageId: template.storageId,
                packageId: template.packageId,
                hasChat,
                hasHistory,
                instanceId: instance?.instanceId
              })
            }
            
            return (
              <div
                key={template.storageId}
                onClick={() => handleTemplateClick(template)}
                className="group relative bg-[#23233a] rounded-2xl border border-[#2a2a44] hover:border-[#3a3a54] transition-all duration-300 hover:scale-105 hover:shadow-2xl h-96 overflow-hidden w-full cursor-pointer"
              >
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
                    {template.templateName}
                  </h3>
                  <p className="text-sm text-neutral-300 mb-2">
                    {subject} • {chapter}
                  </p>
                  {template.grade && (
                    <p className="text-xs text-neutral-400 mb-4">
                      Lớp {template.grade}
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
                      0
                    </span>
                  </div>

                  {/* CTA Buttons */}
                  <div className="mt-auto flex gap-2 flex-wrap">
                    <button
                      onClick={(e) => handleViewPrompt(template, e)}
                      className="inline-flex items-center gap-2 px-5 md:px-6 py-2 md:py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md hover:shadow-lg"
                    >
                      Xem Prompt
                    </button>
                    {hasChat && instance && (
                      <button
                        onClick={(e) => handleGoToChat(template, instance, e)}
                        className="inline-flex items-center gap-2 px-5 md:px-6 py-2 md:py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md hover:shadow-lg"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Đi đến đoạn Chat
                      </button>
                    )}
                    {hasHistory && (
                      <button
                        onClick={(e) => handleViewChatHistory(template, e)}
                        className="inline-flex items-center gap-2 px-5 md:px-6 py-2 md:py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md hover:shadow-lg"
                      >
                        <History className="w-4 h-4" />
                        Xem Lịch Sử Chat
                      </button>
                    )}
                  </div>
                </div>

                {/* Hover glows */}
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-md"></div>
                <div className="pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-r from-indigo-500 to-sky-600 opacity-0 group-hover:opacity-60 transition-all duration-300 -z-10 blur-xl"></div>
              </div>
            )
          })}
        </div>
      )}
      </div>
  )
}

export default PromptStorage


