interface AIRequest {
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

interface AIResponse {
  success: boolean
  data?: string
  error?: string
}

class AIService {
  private webhookUrl: string

  constructor() {
    // Thay đổi URL này thành webhook URL từ n8n workflow của bạn
    this.webhookUrl = 'https://interiorly-pinnatisect-adalyn.ngrok-free.dev/webhook/abc'
  }

  async generatePrompt(requestData: AIRequest): Promise<AIResponse> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          "Access-Control-Allow-Origin": "*",
          'Accept': '*/*',
        //   'User-Agent': 'Thunder Client (https://www.thunderclient.co)'
        },
        body: JSON.stringify({
          "Môn": requestData.monHoc,
          "Lớp": requestData.lop,
          "Chủ đề": requestData.chuDe,
          "Bài học": requestData.baiHoc,
          "Thời lượng tiết học": requestData.thoiLuong,
          "Mức": requestData.mucDo,
          "Loại đề": requestData.loaiKiemTra,
          "Dạng kiểm tra": requestData.hinhThuc,
          "Số câu": requestData.soCau,
          "Tổng điểm": requestData.thangDiem,
          "Yêu cầu thêm": requestData.yeuCauBoSung,
          "submittedAt": new Date().toISOString(),
          "formMode": "test"
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('n8n Response:', result)
      
      // Parse response format: [{"output": "..."}]
      const responseData = Array.isArray(result) ? result[0] : result
      const promptText = responseData?.output || responseData?.response || responseData?.data
      
      return {
        success: true,
        data: promptText
      }
    } catch (error) {
      console.error('AI Service Error:', error)
      
      // Fallback: Generate mock prompt khi không kết nối được
      const mockPrompt = `Vai trò: Bạn là một giáo viên THPT, có chuyên môn trong việc thiết kế giáo án và tài liệu dạy học.

Nhiệm vụ: Dựa trên các thông tin đầu vào dưới đây, hãy tạo ra một bộ tài liệu hoàn chỉnh gồm 3 phần bắt buộc với tiêu đề được giữ nguyên: PHẦN 1: GIÁO ÁN HỌC TẬP; PHẦN 2: TÀI LIỆU HỖ TRỢ; PHẦN 3: ĐỀ THI.

THÔNG TIN ĐẦU VÀO

Môn học: ${requestData.monHoc}

Lớp: ${requestData.lop}

Chủ đề/Chương: ${requestData.chuDe}

Bài học: ${requestData.baiHoc}

Thời lượng giảng dạy: ${requestData.thoiLuong}

Mức độ kiến thức: ${requestData.mucDo}

Loại bài kiểm tra: ${requestData.loaiKiemTra}

Hình thức kiểm tra: ${requestData.hinhThuc}

Số lượng câu hỏi: ${requestData.soCau}

Thang điểm: ${requestData.thangDiem}

Yêu cầu bổ sung: ${requestData.yeuCauBoSung}

[Lưu ý: Đây là prompt mẫu vì không thể kết nối với AI service. Hãy kiểm tra n8n workflow và thử lại.]`

      return {
        success: true,
        data: mockPrompt
      }
    }
  }

  // Method để test kết nối
  async testConnection(): Promise<boolean> {
    try {
      // Test với OPTIONS request để check CORS
      const response = await fetch(this.webhookUrl, {
        method: 'OPTIONS',
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      })
      return response.ok
    } catch {
      return false
    }
  }
}

export const aiService = new AIService()
export type { AIRequest, AIResponse }