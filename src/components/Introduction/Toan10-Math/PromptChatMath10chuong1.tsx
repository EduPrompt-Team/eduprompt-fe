import React, { useState, useRef, useEffect } from 'react'
import { aiService } from '../../../services/aiService'
import type { AIRequest } from '../../../services/aiService'

const PromptChatMath10Chuong1: React.FC = () => {
  const [formData, setFormData] = useState({
    monHoc: '',
    lop: '',
    chuDe: '',
    baiHoc: '',
    thoiLuong: '',
    mucDo: '',
    loaiKiemTra: '',
    hinhThuc: '',
    soCau: '',
    thangDiem: '10',
    yeuCauBoSung: ''
  })

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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Test connection on component mount
  useEffect(() => {
    // Tạm thời disable test connection để tránh CORS error
    setConnectionStatus('unknown')
    // const testConnection = async () => {
    //   const isConnected = await aiService.testConnection()
    //   setConnectionStatus(isConnected ? 'connected' : 'disconnected')
    // }
    // testConnection()
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

  const typewriterEffect = (text: string, messageId: number) => {
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
      // Gọi AI service thật
      const aiRequest: AIRequest = {
        monHoc: formData.monHoc,
        lop: formData.lop,
        chuDe: formData.chuDe,
        baiHoc: formData.baiHoc,
        thoiLuong: formData.thoiLuong,
        mucDo: formData.mucDo,
        loaiKiemTra: formData.loaiKiemTra,
        hinhThuc: formData.hinhThuc,
        soCau: formData.soCau,
        thangDiem: formData.thangDiem,
        yeuCauBoSung: formData.yeuCauBoSung
      }

      const response = await aiService.generatePrompt(aiRequest)
      
      if (response.success && response.data) {
        const responseText = `Tôi đã tạo thành công prompt chuẩn cho bạn!\n\n${response.data}`
        const aiMessageId = messages.length + 2
        
        typewriterEffect(responseText, aiMessageId)
      } else {
        // Fallback nếu AI service lỗi
        const errorMessage = {
          id: messages.length + 2,
          text: `Xin lỗi, có lỗi xảy ra khi tạo prompt: ${response.error || 'Không thể kết nối với AI service'}. Đang sử dụng prompt mẫu:\n\n${generatePrompt()}`,
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
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-[#1a1a2d] border-b border-[#2f2f4a] p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Trợ lý AI - Toán lớp 10</h2>
              <p className="text-sm text-neutral-400">Chương 1: Mệnh đề và Tập hợp</p>
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
  )
}

export default PromptChatMath10Chuong1