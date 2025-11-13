import React, { useState, useRef, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import SiderBar from '@/components/ProfileUser/SiderBar'
import HeaderHomepage from '@/components/Layout/HeaderHomepage'
import HeaderGrade from '@/components/Layout/HeaderGrade'
import { aiService } from '@/services/aiService'
import type { AIRequest } from '@/services/aiService'
import { getCurrentUser } from '@/lib/api'
import { promptInstanceService } from '@/services/promptInstanceService'
import { PromptInstanceStatus } from '@/types/status'

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

interface FormData {
  monHoc: string
  lop: string
  chuDe: string
  baiHoc: string
  thoiLuong: string
  mucDo: string
  loaiKiemTra: string
  hinhThuc: string
  soCau: string
  thangDiem: string
  yeuCauBoSung: string
}

const DynamicChatPage: React.FC = () => {
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
  
  // Get form data from location state (from form page)
  const initialFormData = location.state?.formData || {
    monHoc: subjectName || '',
    lop: gradeNum || '',
    chuDe: chapterText || '',
    baiHoc: '',
    thoiLuong: '',
    mucDo: '',
    loaiKiemTra: '',
    hinhThuc: '',
    soCau: '',
    thangDiem: '10',
    yeuCauBoSung: ''
  }
  
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [messages, setMessages] = useState<Array<{id: number, text: string, isUser: boolean, timestamp: Date}>>([
    {
      id: 1,
      text: "Xin chào! Tôi là trợ lý AI chuyên về giáo dục. Hãy điền thông tin đầu vào ở bên phải (Môn, Lớp, Chủ đề...) rồi nhấn 'Tạo Prompt chuẩn' để tôi tạo prompt cho bạn.",
      isUser: false,
      timestamp: new Date()
    }
  ])
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentInstanceId, setCurrentInstanceId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Get packageId and storageId from location state (if navigating from detail page)
  const templateData = location.state?.template
  // Try multiple ways to get packageId
  let packageId: number | null = null
  let storageId: number | null = null
  if (templateData) {
    packageId = templateData.packageId || templateData.packageID || (templateData as any)?.package?.packageId || null
    // Get storageId from template (StorageTemplate has storageId field)
    storageId = templateData.storageId || (templateData as any)?.storageId || null
  }
  
  // Log để debug
  useEffect(() => {
    if (templateData) {
      console.log('[DynamicChatPage] Template data:', {
        hasTemplate: !!templateData,
        packageId: packageId,
        storageId: storageId,
        templatePackageId: templateData.packageId,
        templateStorageId: templateData.storageId,
        fullTemplate: templateData
      })
    } else {
      console.warn('[DynamicChatPage] ⚠️ Không có template data trong location.state')
    }
  }, [templateData, packageId, storageId])
  
  // Get instance data if restoring chat
  const instanceData = location.state?.instance
  const shouldRestoreChat = location.state?.restoreChat === true
  
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: FormData) => ({ ...prev, [field]: value }))
  }
  
  // Restore chat from instance data
  useEffect(() => {
    if (shouldRestoreChat && instanceData) {
      try {
        console.log('[DynamicChatPage] 🔄 Bắt đầu restore chat từ instance:', instanceData.instanceId)
        console.log('[DynamicChatPage] Instance data:', {
          instanceId: instanceData.instanceId,
          hasInputJson: !!instanceData.inputJson,
          hasOutputJson: !!instanceData.outputJson,
          inputJsonLength: instanceData.inputJson?.length || 0,
          outputJsonLength: instanceData.outputJson?.length || 0
        })
        
        // Set instance ID
        if (instanceData.instanceId) {
          setCurrentInstanceId(instanceData.instanceId)
        }
        
        const restoredMessages: Array<{id: number, text: string, isUser: boolean, timestamp: Date}> = []
        
        // Restore formData and messages from inputJson
        if (instanceData.inputJson) {
          try {
            const inputData = JSON.parse(instanceData.inputJson)
            console.log('[DynamicChatPage] Parsed inputJson:', {
              hasFormData: !!inputData.formData,
              hasConversationHistory: !!inputData.conversationHistory,
              conversationHistoryLength: inputData.conversationHistory?.length || 0
            })
            
            if (inputData.formData) {
              setFormData(inputData.formData)
              console.log('[DynamicChatPage] ✅ Restored formData')
            }
            
            // Restore messages from conversationHistory
            if (inputData.conversationHistory && Array.isArray(inputData.conversationHistory)) {
              console.log('[DynamicChatPage] Restoring', inputData.conversationHistory.length, 'messages from conversationHistory')
              inputData.conversationHistory.forEach((msg: any, index: number) => {
                try {
                  restoredMessages.push({
                    id: msg.id || index + 1,
                    text: msg.text || '',
                    isUser: msg.isUser === true,
                    timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
                  })
                } catch (msgError) {
                  console.warn('[DynamicChatPage] ⚠️ Error parsing message', index, ':', msgError)
                }
              })
              console.log('[DynamicChatPage] ✅ Restored', restoredMessages.length, 'messages from conversationHistory')
            } else {
              console.warn('[DynamicChatPage] ⚠️ No conversationHistory found in inputJson')
            }
          } catch (parseError) {
            console.error('[DynamicChatPage] ❌ Error parsing inputJson:', parseError)
          }
        } else {
          console.warn('[DynamicChatPage] ⚠️ No inputJson found in instance')
        }
        
        // Add outputJson as last message if exists
        // BE đã fix: outputJson sẽ được lưu đúng khi gọi endpoint /complete
        if (instanceData.outputJson && instanceData.outputJson.trim().length > 0) {
          try {
            const outputData = JSON.parse(instanceData.outputJson)
            console.log('[DynamicChatPage] Parsed outputJson:', {
              hasPrompt: !!outputData.prompt,
              promptLength: outputData.prompt?.length || 0,
              hasConversationHistory: !!outputData.conversationHistory,
              conversationHistoryLength: outputData.conversationHistory?.length || 0
            })
            
            // Ưu tiên: Nếu outputJson có conversationHistory, dùng nó (đầy đủ hơn)
            // outputJson chứa conversationHistory đã bao gồm cả prompt cuối cùng
            if (outputData.conversationHistory && Array.isArray(outputData.conversationHistory)) {
              if (restoredMessages.length === 0) {
                // Nếu chưa có messages từ inputJson, dùng conversationHistory từ outputJson
                console.log('[DynamicChatPage] Using conversationHistory from outputJson (no inputJson messages)')
                outputData.conversationHistory.forEach((msg: any, index: number) => {
                  try {
                    restoredMessages.push({
                      id: msg.id || index + 1,
                      text: msg.text || '',
                      isUser: msg.isUser === true,
                      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
                    })
                  } catch (msgError) {
                    console.warn('[DynamicChatPage] ⚠️ Error parsing message from outputJson', index, ':', msgError)
                  }
                })
              } else {
                // Nếu đã có messages từ inputJson, chỉ thêm prompt cuối cùng từ outputJson
                console.log('[DynamicChatPage] Already have messages from inputJson, will add prompt from outputJson')
              }
            }
            
            // Add prompt as last message if exists (nếu chưa có trong conversationHistory)
            // BE đã fix: outputJson sẽ có prompt đầy đủ
            if (outputData.prompt) {
              // Kiểm tra xem prompt đã có trong messages chưa (từ conversationHistory)
              const hasPromptInMessages = restoredMessages.some(msg => 
                msg.text && msg.text.includes(outputData.prompt.substring(0, 50))
              )
              
              if (!hasPromptInMessages) {
                restoredMessages.push({
                  id: restoredMessages.length + 1,
                  text: outputData.prompt,
                  isUser: false,
                  timestamp: new Date()
                })
                console.log('[DynamicChatPage] ✅ Added prompt as last message')
              } else {
                console.log('[DynamicChatPage] ✅ Prompt already in conversationHistory, skipping duplicate')
              }
            }
          } catch (parseError) {
            console.error('[DynamicChatPage] ❌ Error parsing outputJson:', parseError)
            console.error('[DynamicChatPage] outputJson content:', instanceData.outputJson.substring(0, 200))
          }
        } else {
          // outputJson là empty string hoặc null
          // Có thể là instance cũ (trước khi BE fix) hoặc instance chưa được complete
          console.warn('[DynamicChatPage] ⚠️ outputJson is empty or null')
          console.warn('[DynamicChatPage] ⚠️ This may be an old instance (before BE fix) or instance not yet completed')
          
          // Fallback: Nếu không có outputJson, vẫn có thể restore từ inputJson
          // (đã được xử lý ở trên - conversationHistory từ inputJson)
        }
        
        // Set all messages at once
        console.log('[DynamicChatPage] Total restored messages:', restoredMessages.length)
        if (restoredMessages.length > 0) {
          setMessages(restoredMessages)
          console.log('[DynamicChatPage] ✅ Đã restore chat từ instance:', instanceData.instanceId, '-', restoredMessages.length, 'messages')
          console.log('[DynamicChatPage] Restored messages:', restoredMessages.map(msg => ({
            id: msg.id,
            textLength: msg.text?.length || 0,
            isUser: msg.isUser,
            timestamp: msg.timestamp
          })))
        } else {
          console.warn('[DynamicChatPage] ⚠️ No messages to restore!')
        }
      } catch (error) {
        console.error('[DynamicChatPage] ❌ Lỗi khi restore chat:', error)
      }
    } else {
      if (!shouldRestoreChat) {
        console.log('[DynamicChatPage] shouldRestoreChat is false, skipping restore')
      }
      if (!instanceData) {
        console.log('[DynamicChatPage] instanceData is null/undefined, skipping restore')
      }
    }
  }, [shouldRestoreChat, instanceData])
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])
  
  // Load current user on mount
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [])
  
  // Test connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const isConnected = await aiService.testConnection()
        setConnectionStatus(isConnected ? 'connected' : 'disconnected')
      } catch {
        setConnectionStatus('disconnected')
      }
    }
    testConnection()
  }, [])
  
  const generatePrompt = () => {
    return `Vai trò: Bạn là một giáo viên THPT, có chuyên môn trong việc thiết kế giáo án và tài liệu dạy học.

Nhiệm vụ: Dựa trên các thông tin đầu vào dưới đây, hãy tạo ra một bộ tài liệu hoàn chỉnh gồm 3 phần bắt buộc với tiêu đề được giữ nguyên: PHẦN 1: GIÁO ÁN HỌC TẬP; PHẦN 2: TÀI LIỆU HỖ TRỢ; PHẦN 3: ĐỀ THI.

THÔNG TIN ĐẦU VÀO

Môn học: ${formData.monHoc}

Lớp: ${formData.lop}

Chủ đề/Chương: ${formData.chuDe}

Bài học: ${formData.baiHoc}

Thời lượng giảng dạy: ${formData.thoiLuong}

Mức độ kiến thức: ${formData.mucDo}

Loại bài kiểm tra: ${formData.loaiKiemTra}

Hình thức kiểm tra: ${formData.hinhThuc}

Số lượng câu hỏi: ${formData.soCau}

Thang điểm: ${formData.thangDiem}

Yêu cầu bổ sung: ${formData.yeuCauBoSung}`
  }
  
  // Function để cập nhật conversation history trong Prompt Instance
  const updateConversationHistory = async () => {
    if (!currentUser?.userId || !currentInstanceId) return
    
    try {
      await promptInstanceService.update(currentInstanceId, {
        inputJson: JSON.stringify({
          formData,
          conversationHistory: messages.map(msg => ({
            id: msg.id,
            text: msg.text,
            isUser: msg.isUser,
            timestamp: msg.timestamp.toISOString()
          }))
        })
      })
      console.log('[DynamicChatPage] ✅ Đã cập nhật conversation history')
    } catch (error) {
      console.error('[DynamicChatPage] ❌ Lỗi khi cập nhật conversation history:', error)
    }
  }
  
  const typewriterEffect = (text: string, messageId: number, onComplete?: () => void) => {
    let index = 0
    const fullText = text
    const tempMessage = {
      id: messageId,
      text: '',
      isUser: false,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, tempMessage])
    setIsTyping(true)
    
    const typeInterval = setInterval(() => {
      if (index < fullText.length) {
        const currentText = fullText.substring(0, index + 1)
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, text: currentText }
              : msg
          )
        )
        index++
      } else {
        clearInterval(typeInterval)
        setIsTyping(false)
        // Cập nhật lại conversation history trong instance sau khi typewriter hoàn thành
        if (onComplete) {
          onComplete()
        }
      }
    }, 20) // Tốc độ gõ: 20ms mỗi ký tự
  }
  
  const handleGenerate = async () => {
    setIsGenerating(true)
    
    // Thêm tin nhắn của user
    const userMessage = {
      id: messages.length + 1,
      text: `Tôi muốn tạo prompt cho: ${formData.monHoc} lớp ${formData.lop} - ${formData.chuDe}`,
      isUser: true,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    
    try {
      // Validate required fields before calling AI service
      const required = [
        { key: 'monHoc', label: 'Môn học' },
        { key: 'lop', label: 'Lớp' },
        { key: 'chuDe', label: 'Chủ đề/Chương' }
      ]
      const missing = required.filter(r => !formData[r.key as keyof typeof formData]?.toString().trim())
      if (missing.length > 0) {
        const missingLabels = missing.map(m => m.label).join(', ')
        const errorMessage = {
          id: messages.length + 2,
          text: `Vui lòng cung cấp thông tin bắt buộc: ${missingLabels}.`,
          isUser: false,
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, errorMessage])
        setIsGenerating(false)
        return
      }
      
      // Gọi AI service thật - đảm bảo tất cả field đều có giá trị (không rỗng)
      const aiRequest: AIRequest = {
        monHoc: formData.monHoc || '',
        lop: formData.lop || '',
        chuDe: formData.chuDe || '',
        baiHoc: formData.baiHoc || '',
        thoiLuong: formData.thoiLuong || '',
        mucDo: formData.mucDo || '',
        loaiKiemTra: formData.loaiKiemTra || '',
        hinhThuc: formData.hinhThuc || '',
        soCau: formData.soCau || '',
        thangDiem: formData.thangDiem || '10',
        yeuCauBoSung: formData.yeuCauBoSung || ''
      }
      
      const response = await aiService.generatePrompt(aiRequest)
      
      console.log('[DynamicChatPage] AI Response:', {
        success: response.success,
        hasData: !!response.data,
        dataLength: response.data?.length || 0,
        isMock: response.isMock || false
      })
      
      if (response.success && response.data) {
        // Lưu lịch sử chat vào Prompt Instance
        // Backend đã fix: có thể lưu với packageId = null/0 nếu có storageId
        // Hoặc có packageId hợp lệ (> 0)
        const hasPackageId = packageId != null && packageId > 0
        const hasStorageId = storageId != null && storageId > 0
        if (currentUser?.userId && (hasPackageId || hasStorageId)) {
          try {
            const startTime = Date.now()
            
            // Tạo hoặc cập nhật Prompt Instance
            let instanceId = currentInstanceId
            if (!instanceId) {
              // Tạo Prompt Instance mới với toàn bộ conversation history
              // Backend sẽ tự động map packageId từ StorageTemplate nếu storageId được cung cấp
              const createPayload: any = {
                userId: Number(currentUser.userId),
                promptName: `Chat ${formData.monHoc} lớp ${formData.lop} - ${formData.chuDe} - ${new Date().toLocaleString('vi-VN')}`,
                inputJson: JSON.stringify({
                  formData,
                  conversationHistory: messages.map(msg => ({
                    id: msg.id,
                    text: msg.text,
                    isUser: msg.isUser,
                    timestamp: msg.timestamp.toISOString()
                  })),
                  userMessage: userMessage.text,
                  timestamp: userMessage.timestamp.toISOString()
                }),
                outputJson: null
              }
              
              // Gửi packageId nếu có và > 0
              // Backend sẽ tự động map packageId từ StorageTemplate nếu storageId được cung cấp
              if (hasPackageId) {
                createPayload.packageId = packageId
              } else {
                // Nếu packageId = 0 hoặc null, gửi null để backend tự map từ storageId
                createPayload.packageId = null
              }
              
              // Gửi storageId nếu có (để backend tự động map packageId)
              if (hasStorageId) {
                createPayload.storageId = storageId
              }
              
              const promptInstance = await promptInstanceService.create(createPayload)
              instanceId = promptInstance.instanceId
              setCurrentInstanceId(instanceId)
            }
            
            // Hoàn thành instance với output data - sử dụng endpoint /complete
            const processingTime = Date.now() - startTime
            const updatedMessages = [...messages, userMessage]
            
            // Tạo outputJson payload
            const outputJsonPayload = {
              prompt: response.data,
              isMock: response.isMock || false,
              conversationHistory: updatedMessages.map(msg => ({
                id: msg.id,
                text: msg.text,
                isUser: msg.isUser,
                timestamp: msg.timestamp.toISOString()
              })),
              timestamp: new Date().toISOString()
            }
            
            const outputJsonString = JSON.stringify(outputJsonPayload)
            console.log('[DynamicChatPage] Preparing to save outputJson:', {
              instanceId,
              outputJsonLength: outputJsonString.length,
              promptLength: response.data?.length || 0,
              conversationHistoryCount: updatedMessages.length,
              hasPrompt: !!response.data
            })
            
            // Sử dụng endpoint /complete để hoàn thành instance
            try {
              await promptInstanceService.complete(instanceId, {
                outputJson: outputJsonString,
                status: PromptInstanceStatus.Completed,
                processingTimeMs: processingTime
              })
              
              console.log('[DynamicChatPage] ✅ Đã lưu lịch sử chat vào Prompt Instance:', instanceId)
              console.log('[DynamicChatPage] Instance details:', {
                instanceId,
                userId: Number(currentUser.userId),
                packageId,
                storageId,
                hasOutputJson: true,
                outputJsonLength: outputJsonString.length,
                status: PromptInstanceStatus.Completed
              })
            } catch (completeError: any) {
              console.error('[DynamicChatPage] ❌ Lỗi khi gọi endpoint /complete:', completeError)
              console.error('[DynamicChatPage] Error details:', {
                message: completeError?.message,
                response: completeError?.response?.data,
                status: completeError?.response?.status
              })
              // Vẫn tiếp tục, không throw error để không ảnh hưởng đến UI
            }
            
            // Dispatch event để PromptStorage reload instances
            window.dispatchEvent(new CustomEvent('chatHistoryUpdated', {
              detail: { instanceId, packageId, storageId, userId: Number(currentUser.userId) }
            }))
          } catch (saveError: any) {
            console.error('[DynamicChatPage] ❌ Lỗi khi lưu lịch sử chat:', saveError)
            console.error('[DynamicChatPage] ❌ Error details:', {
              message: saveError?.message,
              response: saveError?.response?.data,
              status: saveError?.response?.status,
              packageId: packageId,
              userId: currentUser?.userId
            })
            // Không hiển thị error cho user, chỉ log
          }
        } else {
          // Log khi không lưu được (thiếu packageId/storageId hoặc user)
          console.warn('[DynamicChatPage] ⚠️ Không thể lưu lịch sử chat:', {
            hasUser: !!currentUser?.userId,
            packageId: packageId,
            storageId: storageId,
            reason: !currentUser?.userId 
              ? 'Chưa đăng nhập' 
              : !packageId && !storageId 
                ? 'Thiếu cả packageId và storageId' 
                : 'Unknown'
          })
        }
        
        // Kiểm tra xem có phải mock prompt không
        if (response.isMock) {
          const responseText = `⚠️ Không thể kết nối với AI service (n8n). Đang sử dụng prompt mẫu:\n\n${response.data}`
          const aiMessageId = messages.length + 2
          typewriterEffect(responseText, aiMessageId, () => {
            // Cập nhật lại conversation history sau khi typewriter hoàn thành
            updateConversationHistory()
          })
        } else {
          // Prompt từ n8n thành công
          const responseText = `✅ Tôi đã tạo thành công prompt chuẩn cho bạn!\n\n${response.data}`
          const aiMessageId = messages.length + 2
          typewriterEffect(responseText, aiMessageId, () => {
            // Cập nhật lại conversation history sau khi typewriter hoàn thành
            updateConversationHistory()
          })
        }
      } else {
        // Fallback nếu AI service lỗi hoàn toàn
        const errorMessage = {
          id: messages.length + 2,
          text: `❌ Xin lỗi, có lỗi xảy ra khi tạo prompt: ${response.error || 'Không thể kết nối với AI service'}. Đang sử dụng prompt mẫu:\n\n${generatePrompt()}`,
          isUser: false,
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      // Fallback nếu có lỗi network
      const errorMessage = {
        id: messages.length + 2,
        text: `Xin lỗi, có lỗi kết nối. Đang sử dụng prompt mẫu:\n\n${generatePrompt()}`,
        isUser: false,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <HeaderComponent />
      <div className="flex">
        <SiderBar />
        <main className="flex-1 bg-[#23233a] text-white min-h-[calc(100vh-4rem)] px-0">
          <div className="flex h-[calc(100vh-4rem)]">
            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="bg-[#1a1a2d] border-b border-[#2f2f4a] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Trợ lý AI - {subjectName} lớp {gradeNum}</h2>
                    <p className="text-sm text-neutral-400">{chapterText}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      connectionStatus === 'connected' ? 'bg-green-500' : 
                      connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className="text-xs text-neutral-400">
                      {connectionStatus === 'connected' ? 'AI Connected' : 
                       connectionStatus === 'disconnected' ? 'AI Offline' : 'Checking...'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#23233a] scrollbar-thin scrollbar-track-[#23233a] scrollbar-thumb-[#2a2a44] hover:scrollbar-thumb-[#3a3a54]">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-lg p-3 ${
                      message.isUser 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                        : 'bg-[#1a1a2d] border border-[#2f2f4a] text-neutral-200'
                    }`}>
                      <div className="whitespace-pre-wrap">
                        {message.text}
                        {isTyping && !message.isUser && message.id === messages[messages.length - 1]?.id && (
                          <span className="animate-pulse text-blue-400">|</span>
                        )}
                      </div>
                      <div className={`text-xs mt-1 ${
                        message.isUser ? 'text-blue-100' : 'text-neutral-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-[#1a1a2d] border border-[#2f2f4a] rounded-lg p-3 text-neutral-200">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        <span>Đang tạo prompt chuẩn...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Auto-scroll anchor */}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="bg-[#1a1a2d] border-t border-[#2f2f4a] p-4">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-[#0a0a0f]
                  bg-gradient-to-r from-pink-200 via-rose-200 to-amber-200 hover:from-pink-300 hover:via-rose-300 hover:to-amber-300
                  shadow-md shadow-rose-200/30 hover:shadow-rose-300/40 transition-all duration-300 ease-out
                  disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0a0a0f]"></div>
                      Đang tạo...
                    </>
                  ) : (
                    'Tạo Prompt chuẩn'
                  )}
                </button>
              </div>
            </div>

            {/* Form Sidebar */}
            <div className="w-80 bg-[#1a1a2d] border-l border-[#2f2f4a] p-4 overflow-y-auto scrollbar-thin scrollbar-track-[#1a1a2d] scrollbar-thumb-[#2a2a44] hover:scrollbar-thumb-[#3a3a54]">
              <h3 className="text-lg font-semibold text-white mb-4">Thông tin đầu vào</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Môn học</label>
                  <input
                    type="text"
                    value={formData.monHoc}
                    onChange={(e) => handleInputChange('monHoc', e.target.value)}
                    className="w-full px-3 py-2 bg-[#23233a] border border-[#2a2a44] rounded-md text-neutral-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Lớp</label>
                  <input
                    type="text"
                    value={formData.lop}
                    onChange={(e) => handleInputChange('lop', e.target.value)}
                    className="w-full px-3 py-2 bg-[#23233a] border border-[#2a2a44] rounded-md text-neutral-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Chủ đề/Chương</label>
                  <input
                    type="text"
                    value={formData.chuDe}
                    onChange={(e) => handleInputChange('chuDe', e.target.value)}
                    className="w-full px-3 py-2 bg-[#23233a] border border-[#2a2a44] rounded-md text-neutral-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Bài học</label>
                  <input
                    type="text"
                    value={formData.baiHoc}
                    onChange={(e) => handleInputChange('baiHoc', e.target.value)}
                    className="w-full px-3 py-2 bg-[#23233a] border border-[#2a2a44] rounded-md text-neutral-200 focus:outline-none focus:border-blue-500"
                    placeholder="Nhập tên bài học"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Thời lượng</label>
                  <input
                    type="text"
                    value={formData.thoiLuong}
                    onChange={(e) => handleInputChange('thoiLuong', e.target.value)}
                    className="w-full px-3 py-2 bg-[#23233a] border border-[#2a2a44] rounded-md text-neutral-200 focus:outline-none focus:border-blue-500"
                    placeholder="Số tiết"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Mức độ kiến thức</label>
                  <select
                    value={formData.mucDo}
                    onChange={(e) => handleInputChange('mucDo', e.target.value)}
                    className="w-full px-3 py-2 bg-[#23233a] border border-[#2a2a44] rounded-md text-neutral-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Chọn mức độ</option>
                    <option value="CƠ BẢN">CƠ BẢN</option>
                    <option value="TRUNG BÌNH">TRUNG BÌNH</option>
                    <option value="NÂNG CAO">NÂNG CAO</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Loại bài kiểm tra</label>
                  <select
                    value={formData.loaiKiemTra}
                    onChange={(e) => handleInputChange('loaiKiemTra', e.target.value)}
                    className="w-full px-3 py-2 bg-[#23233a] border border-[#2a2a44] rounded-md text-neutral-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Chọn loại</option>
                    <option value="15 phút">15 phút</option>
                    <option value="45 phút">45 phút</option>
                    <option value="Học kỳ">Học kỳ</option>
                    <option value="Tự chọn">Tự chọn</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Hình thức kiểm tra</label>
                  <select
                    value={formData.hinhThuc}
                    onChange={(e) => handleInputChange('hinhThuc', e.target.value)}
                    className="w-full px-3 py-2 bg-[#23233a] border border-[#2a2a44] rounded-md text-neutral-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Chọn hình thức</option>
                    <option value="TỰ LUẬN">TỰ LUẬN</option>
                    <option value="TRẮC NGHIỆM">TRẮC NGHIỆM</option>
                    <option value="HỖN HỢP">HỖN HỢP</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Số lượng câu hỏi</label>
                  <input
                    type="text"
                    value={formData.soCau}
                    onChange={(e) => handleInputChange('soCau', e.target.value)}
                    className="w-full px-3 py-2 bg-[#23233a] border border-[#2a2a44] rounded-md text-neutral-200 focus:outline-none focus:border-blue-500"
                    placeholder="Tổng số câu"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Thang điểm</label>
                  <input
                    type="text"
                    value={formData.thangDiem}
                    onChange={(e) => handleInputChange('thangDiem', e.target.value)}
                    className="w-full px-3 py-2 bg-[#23233a] border border-[#2a2a44] rounded-md text-neutral-200 focus:outline-none focus:border-blue-500"
                    placeholder="Ví dụ: 10"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Yêu cầu bổ sung</label>
                  <textarea
                    value={formData.yeuCauBoSung}
                    onChange={(e) => handleInputChange('yeuCauBoSung', e.target.value)}
                    className="w-full px-3 py-2 bg-[#23233a] border border-[#2a2a44] rounded-md text-neutral-200 focus:outline-none focus:border-blue-500"
                    rows={3}
                    placeholder="Mô tả các yêu cầu khác..."
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default DynamicChatPage

