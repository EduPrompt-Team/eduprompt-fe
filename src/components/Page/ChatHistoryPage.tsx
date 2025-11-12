import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import SiderBar from '@/components/ProfileUser/SiderBar'
import HeaderHomepage from '@/components/Layout/HeaderHomepage'
import HeaderGrade from '@/components/Layout/HeaderGrade'
import { promptInstanceService } from '@/services/promptInstanceService'
import { getCurrentUser } from '@/lib/api'
import { MessageCircle, Clock, ArrowLeft } from 'lucide-react'
import type { PromptInstanceDto } from '@/types/dto/prompt'
import type { StorageTemplate } from '@/services/storageTemplateService'

// Subject name mapping: key -> Vietnamese name
const subjectDisplayMap: Record<string, string> = {
  'math': 'Toán',
  'physics': 'Vật lý',
  'chemistry': 'Hóa học',
  'biology': 'Sinh học',
  'literature': 'Ngữ văn',
  'history': 'Lịch sử',
  'geography': 'Địa lý',
  'english': 'Tiếng Anh',
  'informatics': 'Tin học',
  'technology': 'Công nghệ',
}

// Grade-specific header components
const getHeaderComponent = (grade: string) => {
  switch (grade) {
    case '10':
      return HeaderGrade
    case '11':
      return HeaderGrade
    case '12':
      return HeaderGrade
    default:
      return HeaderHomepage
  }
}

const ChatHistoryPage: React.FC = () => {
  const navigate = useNavigate()
  const params = useParams<{ grade: string; subject: string; chapter: string }>()
  const location = useLocation()
  
  // Extract grade from params or pathname
  let grade = params.grade
  if (!grade) {
    const pathMatch = window.location.pathname.match(/\/grade(\d+)\//)
    if (pathMatch) {
      grade = pathMatch[1]
    }
  }
  
  const subject = params.subject || ''
  const chapter = params.chapter || ''
  
  // Extract chapter number from chapter param (e.g., "chuong1" -> 1)
  const chapterNum = chapter ? parseInt(chapter.replace('chuong', '')) || 1 : 1
  const chapterText = `Chương ${chapterNum}`
  
  // Map subject key to Vietnamese name
  const subjectName = subjectDisplayMap[subject] || subject || ''
  const gradeNum = grade || '10'
  
  const HeaderComponent = getHeaderComponent(gradeNum)
  
  // Get template data from location state
  const templateData = location.state?.template as StorageTemplate | undefined
  
  const [instances, setInstances] = useState<PromptInstanceDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [])
  
  // Load chat history instances
  const loadChatHistory = React.useCallback(async () => {
    if (!templateData) {
      setError('Không tìm thấy thông tin template')
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      // Try to load instances by storageId first (endpoint đã được BE fix)
      let loadedInstances: PromptInstanceDto[] = []
      
      if (templateData.storageId && templateData.storageId > 0) {
        try {
          // Sử dụng endpoint mới /storage/{storageId}/my để lấy instances của user hiện tại
          // BE đã fix: Endpoint này filter theo UserId từ JWT token
          const storageInstances = await promptInstanceService.getMyInstancesByStorageId(templateData.storageId)
          console.log('[ChatHistoryPage] Loaded instances by storageId/my:', storageInstances.length)
          console.log('[ChatHistoryPage] Instances from storageId/my endpoint:', storageInstances.map(inst => ({
            instanceId: inst.instanceId,
            userId: inst.userId,
            packageId: inst.packageId,
            storageId: inst.storageId,
            hasOutputJson: !!inst.outputJson,
            outputJsonLength: inst.outputJson?.length || 0
          })))
          
          // Chỉ lấy instances có outputJson từ storageId endpoint
          // (vì endpoint này có thể trả về instances chưa completed)
          const completedStorageInstances = storageInstances.filter(inst => inst.outputJson != null)
          console.log('[ChatHistoryPage] Completed instances from storageId/my:', completedStorageInstances.length)
          
          // Lưu instance IDs từ storageId để merge sau
          loadedInstances = completedStorageInstances
        } catch (err: any) {
          // If 404, có thể không có instances cho storageId này hoặc endpoint chưa có
          if (err?.response?.status !== 404) {
            console.warn('[ChatHistoryPage] Failed to load by storageId/my:', err)
          } else {
            console.log('[ChatHistoryPage] No instances found for storageId/my (404), using fallback')
          }
          // Nếu fail, loadedInstances vẫn là [] (sẽ dùng user instances)
        }
      }
      
      // Luôn load từ user instances để đảm bảo không bỏ sót instance nào
      // (ngay cả khi đã có từ storageId endpoint, vì có thể có instance mới chưa được endpoint trả về)
      
      // Load all user instances and filter by packageId hoặc storageId
      // BE đã fix: GetByUserIdAsync giờ trả về tất cả instances
      // Luôn load từ user instances để đảm bảo không bỏ sót (ngay cả khi đã có từ storageId endpoint)
      if (currentUser?.userId) {
        const userInstances = await promptInstanceService.getByUser(Number(currentUser.userId))
        console.log('[ChatHistoryPage] Loaded user instances:', userInstances.length, 'total')
        console.log('[ChatHistoryPage] Template data for filtering:', {
          templatePackageId: templateData.packageId,
          templateStorageId: templateData.storageId
        })
        console.log('[ChatHistoryPage] All user instances (before filter):', userInstances.length, 'total')
        console.log('[ChatHistoryPage] All user instances details:', userInstances.map(inst => ({
          instanceId: inst.instanceId,
          packageId: inst.packageId,
          storageId: inst.storageId,
          hasOutputJson: !!inst.outputJson,
          outputJsonLength: inst.outputJson?.length || 0,
          promptName: inst.promptName,
          executedAt: inst.executedAt
        })))
        
        // Filter instances that match this template's packageId OR storageId and have outputJson
        const filteredUserInstances = userInstances.filter(
          (inst) => {
            // Match packageId (handle null case)
            const packageMatch = inst.packageId != null && 
                                 templateData.packageId != null && 
                                 inst.packageId === templateData.packageId
            
            // Match storageId (nếu instance có storageId và template có storageId)
            const storageMatch = inst.storageId != null && 
                                templateData.storageId != null && 
                                inst.storageId === templateData.storageId
            
            // Check outputJson
            const hasOutput = inst.outputJson != null
            
            // Match nếu packageId hoặc storageId match VÀ có outputJson
            const matches = (packageMatch || storageMatch) && hasOutput
            
            if (matches) {
              console.log('[ChatHistoryPage] ✅ Instance matched:', {
                instanceId: inst.instanceId,
                packageId: inst.packageId,
                storageId: inst.storageId,
                packageMatch,
                storageMatch,
                hasOutput
              })
            } else {
              // Log instances bị loại bỏ và lý do
              console.log('[ChatHistoryPage] ❌ Instance NOT matched:', {
                instanceId: inst.instanceId,
                packageId: inst.packageId,
                storageId: inst.storageId,
                templatePackageId: templateData.packageId,
                templateStorageId: templateData.storageId,
                packageMatch,
                storageMatch,
                hasOutput,
                reason: !hasOutput ? 'No outputJson' : 
                        !packageMatch && !storageMatch ? 'PackageId and StorageId not match' : 
                        'Unknown'
              })
            }
            
            return matches
          }
        )
        console.log('[ChatHistoryPage] Filtered instances from user:', filteredUserInstances.length, 'matching instances')
        console.log('[ChatHistoryPage] Filtered instance IDs from user:', filteredUserInstances.map(inst => inst.instanceId))
        
        // Merge với instances từ storageId endpoint (nếu có)
        // Tạo một Set để tránh duplicate
        const existingInstanceIds = new Set(loadedInstances.map(inst => inst.instanceId))
        const newInstances = filteredUserInstances.filter(inst => !existingInstanceIds.has(inst.instanceId))
        loadedInstances = [...loadedInstances, ...newInstances]
        
        console.log('[ChatHistoryPage] Total instances after merge:', loadedInstances.length)
        console.log('[ChatHistoryPage] All instance IDs:', loadedInstances.map(inst => inst.instanceId))
      }
      
      // Sort by executedAt (newest first) - đảm bảo mới nhất ở trên cùng
      loadedInstances.sort((a, b) => {
        const timeA = new Date(a.executedAt).getTime()
        const timeB = new Date(b.executedAt).getTime()
        return timeB - timeA // Descending: newest first
      })
      
      console.log('[ChatHistoryPage] Sorted instances (newest first):', loadedInstances.map(inst => ({
        instanceId: inst.instanceId,
        executedAt: inst.executedAt,
        promptName: inst.promptName
      })))
      
      console.log('[ChatHistoryPage] ✅ Final instances to display:', loadedInstances.length)
      console.log('[ChatHistoryPage] Final instance IDs:', loadedInstances.map(inst => inst.instanceId))
      
      setInstances(loadedInstances)
    } catch (err: any) {
      console.error('[ChatHistoryPage] Failed to load chat history:', err)
      setError(err?.response?.data?.message || 'Không thể tải lịch sử chat')
    } finally {
      setLoading(false)
    }
  }, [templateData, currentUser])
  
  // Initial load
  useEffect(() => {
    loadChatHistory()
  }, [loadChatHistory])
  
  // Reload when chat history is updated
  useEffect(() => {
    const handleChatHistoryUpdate = (event: any) => {
      const { instanceId, storageId, packageId } = event.detail || {}
      console.log('[ChatHistoryPage] Chat history updated event received:', { instanceId, storageId, packageId })
      console.log('[ChatHistoryPage] Current template data:', {
        templateStorageId: templateData?.storageId,
        templatePackageId: templateData?.packageId
      })
      
      // Reload nếu storageId hoặc packageId match với template hiện tại
      const storageMatch = templateData && storageId && templateData.storageId === storageId
      const packageMatch = templateData && packageId && templateData.packageId === packageId
      
      if (storageMatch || packageMatch) {
        console.log('[ChatHistoryPage] ✅ Match found, reloading chat history after new chat saved...', {
          storageMatch,
          packageMatch,
          newInstanceId: instanceId
        })
        // Delay một chút để đảm bảo BE đã commit transaction
        setTimeout(() => {
          loadChatHistory()
        }, 800) // Tăng delay lên 800ms để đảm bảo BE đã commit
      } else {
        console.log('[ChatHistoryPage] ⚠️ No match, skipping reload:', {
          storageMatch,
          packageMatch,
          eventStorageId: storageId,
          eventPackageId: packageId,
          templateStorageId: templateData?.storageId,
          templatePackageId: templateData?.packageId
        })
      }
    }
    
    window.addEventListener('chatHistoryUpdated', handleChatHistoryUpdate)
    
    return () => {
      window.removeEventListener('chatHistoryUpdated', handleChatHistoryUpdate)
    }
  }, [templateData, loadChatHistory])
  
  // Reload when page becomes visible (user returns from chat page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[ChatHistoryPage] Page became visible, reloading chat history...')
        // Delay để đảm bảo không reload quá nhiều
        setTimeout(() => {
          loadChatHistory()
        }, 300)
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [loadChatHistory])
  
  const handleGoToChat = (instance: PromptInstanceDto) => {
    if (!templateData) {
      console.warn('[ChatHistoryPage] Cannot navigate: templateData is missing')
      return
    }
    
    console.log('[ChatHistoryPage] Navigating to chat with instance:', {
      instanceId: instance.instanceId,
      hasInputJson: !!instance.inputJson,
      hasOutputJson: !!instance.outputJson,
      inputJsonLength: instance.inputJson?.length || 0,
      outputJsonLength: instance.outputJson?.length || 0,
      promptName: instance.promptName
    })
    
    // Navigate to chat page with instance data to restore conversation
    navigate(`/grade${grade}/${subject}/detail/${chapter}/chat`, {
      state: { 
        template: templateData,
        instance,
        restoreChat: true
      }
    })
  }
  
  const handleBack = () => {
    navigate(-1)
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return (
    <div className="min-h-screen bg-[#1a1a2e]">
      <HeaderComponent />
      <div className="flex">
        <SiderBar />
        <div className="flex-1 ml-64">
          <div className="py-8 px-10">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={handleBack}
                className="mb-4 inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </button>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Lịch Sử Chat
              </h1>
              {templateData && (
                <p className="text-neutral-400">
                  {templateData.templateName} • {subjectName} • {chapterText} • Lớp {gradeNum}
                </p>
              )}
            </div>
            
            <div className="mt-4 h-0.5 -mx-10 bg-white"></div>
            
            {/* Loading State */}
            {loading && (
              <div className="mt-6 text-center text-neutral-400">
                Đang tải lịch sử chat...
              </div>
            )}
            
            {/* Error State */}
            {error && !loading && (
              <div className="mt-6 text-center text-red-400">
                {error}
              </div>
            )}
            
            {/* Empty State */}
            {!loading && !error && instances.length === 0 && (
              <div className="mt-6 text-center py-12">
                <MessageCircle className="w-16 h-16 mx-auto text-neutral-600 mb-4" />
                <p className="text-neutral-400 text-lg mb-2">Chưa có lịch sử chat nào</p>
                <p className="text-neutral-500 text-sm">Hãy bắt đầu chat với AI để tạo prompt</p>
              </div>
            )}
            
            {/* Chat History List */}
            {!loading && !error && instances.length > 0 && (
              <div className="mt-6 space-y-4">
                {/* Debug: Show count */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mb-2 text-xs text-neutral-500">
                    Hiển thị {instances.length} lịch sử chat
                  </div>
                )}
                {instances.map((instance) => {
                  let promptPreview = ''
                  try {
                    if (instance.outputJson) {
                      const outputData = JSON.parse(instance.outputJson)
                      promptPreview = outputData.prompt || ''
                      // Truncate preview
                      if (promptPreview.length > 150) {
                        promptPreview = promptPreview.substring(0, 150) + '...'
                      }
                    }
                  } catch (e) {
                    // Ignore parse errors
                  }
                  
                  return (
                    <div
                      key={instance.instanceId}
                      className="bg-[#23233a] rounded-lg border border-[#2a2a44] hover:border-[#3a3a54] transition-all p-6 cursor-pointer"
                      onClick={() => handleGoToChat(instance)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <MessageCircle className="w-5 h-5 text-indigo-400" />
                            <h3 className="text-lg font-semibold text-white">
                              {instance.promptName}
                            </h3>
                          </div>
                          
                          {promptPreview && (
                            <p className="text-neutral-400 text-sm mb-3 line-clamp-2">
                              {promptPreview}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-neutral-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(instance.executedAt)}
                            </span>
                            {instance.processingTimeMs && (
                              <span>
                                {instance.processingTimeMs}ms
                              </span>
                            )}
                            {instance.status && (
                              <span className={`px-2 py-0.5 rounded ${
                                instance.status === 'Completed' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {instance.status}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleGoToChat(instance)
                          }}
                          className="ml-4 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white text-sm font-semibold transition-all"
                        >
                          Mở Chat
                        </button>
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

export default ChatHistoryPage

