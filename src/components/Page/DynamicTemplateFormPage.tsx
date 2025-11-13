import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import SiderBar from '@/components/ProfileUser/SiderBar'
import HeaderHomepage from '@/components/Layout/HeaderHomepage'
import HeaderGrade from '@/components/Layout/HeaderGrade'
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

const DynamicTemplateFormPage: React.FC = () => {
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
  
  // Get template data from location state (if navigating from detail page)
  const templateData = location.state?.template as StorageTemplate | undefined
  
  // Form state
  const [formData, setFormData] = useState({
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
  })
  
  // Load template data if available
  useEffect(() => {
    if (templateData) {
      setFormData(prev => ({
        ...prev,
        monHoc: templateData.subject || subjectName || prev.monHoc,
        lop: templateData.grade || gradeNum || prev.lop,
        chuDe: templateData.chapter || chapterText || prev.chuDe,
      }))
    }
  }, [templateData, subjectName, gradeNum, chapterText])
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  const handleCopy = async () => {
    const prompt = generatePrompt()
    try {
      await navigator.clipboard.writeText(prompt)
    } catch {
      // no-op
    }
  }
  
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
  
  const handleUsePrompt = () => {
    // Navigate to chat page with form data and template (for packageId)
    navigate(`/grade${grade}/${subject}/detail/${chapter}/chat`, {
      state: { 
        formData,
        template: templateData // Truyền template để chat page có thể lấy packageId
      }
    })
  }
  
  const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="inline-block px-2 py-0.5 rounded bg-[#23233a] border border-[#2a2a44] text-neutral-200 text-xs align-middle">{children}</span>
  )
  
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <HeaderComponent />
      <div className="flex">
        <SiderBar />
        <main className="flex-1 bg-[#23233a] text-white min-h-[calc(100vh-4rem)] px-0">
          <div className="px-4 md:px-6 lg:px-10 py-6 text-white">
            {/* Header row */}
            <div className="flex items-center justify-between max-w-6xl mx-auto">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-[#0a0a0f]
                  bg-gradient-to-r from-pink-200 via-rose-200 to-amber-200 hover:from-pink-300 hover:via-rose-300 hover:to-amber-300
                  shadow-md shadow-rose-200/30 hover:shadow-rose-300/40 transition-all duration-300 ease-out"
                >
                  Copy prompt
                </button>
              </div>
            </div>

            {/* Card */}
            <div className="max-w-6xl mx-auto mt-4">
              <div className="relative rounded-2xl p-[2px] overflow-hidden">
                <div className="absolute inset-0 bg-[conic-gradient(at_50%_50%,#ff3d3d_0%,#ffbf00_20%,#00ff80_40%,#00c3ff_60%,#8a2be2_80%,#ff3d3d_100%)] opacity-60"></div>
                <div className="relative z-10 rounded-[14px] border border-[#2f2f4a] bg-[#1a1a2d] p-5 md:p-6 pb-16">
                  <div className="space-y-4">
                    <p className="text-sm text-neutral-300">
                      <span className="font-semibold text-white">Vai trò:</span> Bạn là một giáo viên THPT, có chuyên môn trong việc thiết kế giáo án và tài liệu dạy học.
                    </p>
                    <p className="text-sm text-neutral-300">
                      <span className="font-semibold text-white">Nhiệm vụ:</span> Dựa trên các thông tin đầu vào dưới đây, hãy tạo ra một bộ tài liệu hoàn chỉnh gồm 3 phần bắt buộc với tiêu đề được giữ nguyên: <span className="font-semibold">PHẦN 1: GIÁO ÁN HỌC TẬP</span>; <span className="font-semibold">PHẦN 2: TÀI LIỆU HỖ TRỢ</span>; <span className="font-semibold">PHẦN 3: ĐỀ THI</span>.
                    </p>

                    <h3 className="text-sm font-semibold tracking-wide text-white">THÔNG TIN ĐẦU VÀO</h3>
                    <ul className="space-y-3 text-sm text-neutral-300">
                      <li>• <span className="font-semibold text-white">Môn học:</span> <Pill>{formData.monHoc || '[Nhập tên môn học]'}</Pill></li>
                      <li>• <span className="font-semibold text-white">Lớp:</span> <Pill>{formData.lop || '[Nhập khối lớp]'}</Pill></li>
                      <li>• <span className="font-semibold text-white">Chủ đề/Chương:</span> <Pill>{formData.chuDe || '[Nhập tên chủ đề hoặc chương]'}</Pill></li>
                      <li>• <span className="font-semibold text-white">Bài học:</span> 
                        <input
                          type="text"
                          value={formData.baiHoc}
                          onChange={(e) => handleInputChange('baiHoc', e.target.value)}
                          placeholder="Nhập tên bài học"
                          className="ml-2 px-2 py-1 bg-[#23233a] border border-[#2a2a44] rounded text-neutral-200 text-xs focus:outline-none focus:border-blue-500 w-48"
                        />
                      </li>
                      <li>• <span className="font-semibold text-white">Thời lượng giảng dạy:</span> 
                        <input
                          type="text"
                          value={formData.thoiLuong}
                          onChange={(e) => handleInputChange('thoiLuong', e.target.value)}
                          placeholder="Nhập số tiết"
                          className="ml-2 px-2 py-1 bg-[#23233a] border border-[#2a2a44] rounded text-neutral-200 text-xs focus:outline-none focus:border-blue-500 w-32"
                        />
                      </li>
                      <li>• <span className="font-semibold text-white">Mức độ kiến thức:</span> 
                        <select
                          value={formData.mucDo}
                          onChange={(e) => handleInputChange('mucDo', e.target.value)}
                          className="ml-2 px-2 py-1 bg-[#23233a] border border-[#2a2a44] rounded text-neutral-200 text-xs focus:outline-none focus:border-blue-500"
                        >
                          <option value="">[Chọn một]</option>
                          <option value="CƠ BẢN">CƠ BẢN</option>
                          <option value="TRUNG BÌNH">TRUNG BÌNH</option>
                          <option value="NÂNG CAO">NÂNG CAO</option>
                        </select>
                      </li>
                      <li>• <span className="font-semibold text-white">Loại bài kiểm tra:</span> 
                        <select
                          value={formData.loaiKiemTra}
                          onChange={(e) => handleInputChange('loaiKiemTra', e.target.value)}
                          className="ml-2 px-2 py-1 bg-[#23233a] border border-[#2a2a44] rounded text-neutral-200 text-xs focus:outline-none focus:border-blue-500"
                        >
                          <option value="">[Chọn một]</option>
                          <option value="15 phút">15 phút</option>
                          <option value="45 phút">45 phút</option>
                          <option value="Học kỳ">Học kỳ</option>
                          <option value="Tự chọn">Tự chọn</option>
                        </select>
                      </li>
                      <li>• <span className="font-semibold text-white">Hình thức kiểm tra:</span> 
                        <select
                          value={formData.hinhThuc}
                          onChange={(e) => handleInputChange('hinhThuc', e.target.value)}
                          className="ml-2 px-2 py-1 bg-[#23233a] border border-[#2a2a44] rounded text-neutral-200 text-xs focus:outline-none focus:border-blue-500"
                        >
                          <option value="">[Chọn một]</option>
                          <option value="TỰ LUẬN">TỰ LUẬN</option>
                          <option value="TRẮC NGHIỆM">TRẮC NGHIỆM</option>
                          <option value="HỖN HỢP">HỖN HỢP</option>
                        </select>
                      </li>
                      <li className="pl-4">- <span className="font-semibold text-white">Nếu là Hỗn hợp, ghi rõ:</span> 
                        <input
                          type="text"
                          value={formData.yeuCauBoSung}
                          onChange={(e) => handleInputChange('yeuCauBoSung', e.target.value)}
                          placeholder="Ví dụ: 70% trắc nghiệm, 30% tự luận"
                          className="ml-2 px-2 py-1 bg-[#23233a] border border-[#2a2a44] rounded text-neutral-200 text-xs focus:outline-none focus:border-blue-500 w-64"
                        />
                      </li>
                      <li>• <span className="font-semibold text-white">Số lượng câu hỏi:</span> 
                        <input
                          type="text"
                          value={formData.soCau}
                          onChange={(e) => handleInputChange('soCau', e.target.value)}
                          placeholder="Nhập tổng số câu"
                          className="ml-2 px-2 py-1 bg-[#23233a] border border-[#2a2a44] rounded text-neutral-200 text-xs focus:outline-none focus:border-blue-500 w-32"
                        />
                      </li>
                      <li>• <span className="font-semibold text-white">Thang điểm:</span> 
                        <input
                          type="text"
                          value={formData.thangDiem}
                          onChange={(e) => handleInputChange('thangDiem', e.target.value)}
                          placeholder="Ví dụ: 10"
                          className="ml-2 px-2 py-1 bg-[#23233a] border border-[#2a2a44] rounded text-neutral-200 text-xs focus:outline-none focus:border-blue-500 w-32"
                        />
                      </li>
                      <li>• <span className="font-semibold text-white">Yêu cầu bổ sung:</span> 
                        <textarea
                          value={formData.yeuCauBoSung}
                          onChange={(e) => handleInputChange('yeuCauBoSung', e.target.value)}
                          placeholder="Mô tả các yêu cầu khác..."
                          className="ml-2 px-2 py-1 bg-[#23233a] border border-[#2a2a44] rounded text-neutral-200 text-xs focus:outline-none focus:border-blue-500 w-96 h-16 resize-none"
                        />
                      </li>
                    </ul>

                    <div className="border-t border-[#2f2f4a] pt-4"></div>
                    <h3 className="text-sm font-semibold tracking-wide text-white">YÊU CẦU BẮT BUỘC</h3>
                    <ol className="list-decimal ml-5 space-y-3 text-sm text-neutral-300">
                      <li>
                        <span className="font-semibold text-white">Cấu trúc nội dung:</span> Tuân thủ nghiêm ngặt 3 phần đã nêu. Sử dụng đúng mẫu các mục con cho từng phần. Không thêm hoặc bớt bất kỳ văn bản nào ngoài khuôn khổ yêu cầu.
                      </li>
                      <li>
                        <span className="font-semibold text-white">Yêu cầu cho đề thi:</span>
                        <ul className="mt-2 space-y-2">
                          <li className="pl-1">- Nếu hình thức là <span className="font-semibold text-white">TRẮC NGHIỆM</span>, mỗi câu hỏi phải có chính xác 4 phương án (A, B, C, D) và chỉ có một phương án đúng.</li>
                          <li className="pl-1">- Nếu hình thức là <span className="font-semibold text-white">TỰ LUẬN</span>, phải đi kèm đáp án chi tiết và biểu điểm chấm rõ ràng cho từng ý.</li>
                          <li className="pl-1">- Nếu hình thức là <span className="font-semibold text-white">HỖN HỢP</span>, phải phân tách rõ ràng hai phần trắc nghiệm và tự luận.</li>
                        </ul>
                      </li>
                    </ol>
                    
                    {/* Use Button - Absolute positioned */}
                    <button
                      onClick={handleUsePrompt}
                      className="absolute bottom-8 right-4 inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-[#0a0a0f]
                      bg-gradient-to-r from-pink-200 via-rose-200 to-amber-200 hover:from-pink-300 hover:via-rose-300 hover:to-amber-300
                      shadow-md shadow-rose-200/30 hover:shadow-rose-300/40 transition-all duration-300 ease-out"
                    >
                      Bấm vào đây để sử dụng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default DynamicTemplateFormPage

