import React from 'react'

const PromptTemplate10Chuong1: React.FC = () => {
  const prompt = `Vai trò: Bạn là một giáo viên THPT, có chuyên môn trong việc thiết kế giáo án và tài liệu dạy học.

Nhiệm vụ: Dựa trên các thông tin đầu vào dưới đây, hãy tạo ra một bộ tài liệu hoàn chỉnh gồm 3 phần bắt buộc với tiêu đề được giữ nguyên: PHẦN 1: GIÁO ÁN HỌC TẬP; PHẦN 2: TÀI LIỆU HỖ TRỢ; PHẦN 3: ĐỀ THI.

THÔNG TIN ĐẦU VÀO

Môn học: [Nhập tên môn học]

Lớp: [Nhập khối lớp]

Chủ đề/Chương: [Nhập tên chủ đề hoặc chương]

Bài học: [Nhập tên bài học]

Thời lượng giảng dạy: [Nhập số tiết]

Mức độ kiến thức: [Chọn một: CƠ BẢN / TRUNG BÌNH / NÂNG CAO]

Loại bài kiểm tra: [Chọn một: 15 phút / 45 phút / Học kỳ / Tự chọn]

Hình thức kiểm tra: [Chọn một: TỰ LUẬN / TRẮC NGHIỆM / HỖN HỢP]

Nếu là Hỗn hợp, ghi rõ: [Ví dụ: 70% trắc nghiệm, 30% tự luận hoặc 7 câu trắc nghiệm, 3 câu tự luận]

Số lượng câu hỏi: [Nhập tổng số câu]

Thang điểm: [Nhập tổng điểm, ví dụ: 10 (10 điểm)]

Yêu cầu bổ sung: [Mô tả các yêu cầu khác, ví dụ: Cần 2 phiên bản đề khác nhau, xây dựng ma trận đề thi, đáp án phải có thang điểm chi tiết (rubric)]

YÊU CẦU BẮT BUỘC

Cấu trúc nội dung: Tuân thủ nghiêm ngặt 3 phần đã nêu. Sử dụng đúng mẫu các mục con cho từng phần. Không thêm hoặc bớt bất kỳ văn bản nào ngoài khuôn khổ yêu cầu.

Yêu cầu cho đề thi:

Nếu hình thức là TRẮC NGHIỆM, mỗi câu hỏi phải có chính xác 4 phương án (A, B, C, D) và chỉ có một phương án đúng.

Nếu hình thức là TỰ LUẬN, phải đi kèm đáp án chi tiết và biểu điểm chấm rõ ràng cho từng ý.

Nếu hình thức là HỖN HỢP, phải phân tách rõ ràng hai phần trắc nghiệm và tự luận.`


  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
    } catch {
      // no-op
    }
  }

  const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="inline-block px-2 py-0.5 rounded bg-[#23233a] border border-[#2a2a44] text-neutral-200 text-xs align-middle">{children}</span>
  )

  return (
    <div className="px-4 md:px-6 lg:px-10 py-6 text-white">
      {/* Header row */}
      <div className="flex items-center justify-between max-w-6xl mx-auto ">
        <div className="flex items-center gap-3 ">
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
              <p className="text-sm text-neutral-300"><span className="font-semibold text-white">Vai trò:</span> Bạn là một giáo viên THPT, có chuyên môn trong việc thiết kế giáo án và tài liệu dạy học.</p>
              <p className="text-sm text-neutral-300"><span className="font-semibold text-white">Nhiệm vụ:</span> Dựa trên các thông tin đầu vào dưới đây, hãy tạo ra một bộ tài liệu hoàn chỉnh gồm 3 phần bắt buộc với tiêu đề được giữ nguyên: <span className="font-semibold">PHẦN 1: GIÁO ÁN HỌC TẬP</span>; <span className="font-semibold">PHẦN 2: TÀI LIỆU HỖ TRỢ</span>; <span className="font-semibold">PHẦN 3: ĐỀ THI</span>.</p>

              <h3 className="text-sm font-semibold tracking-wide text-white">THÔNG TIN ĐẦU VÀO</h3>
              <ul className="space-y-3 text-sm text-neutral-300">
                <li>• <span className="font-semibold text-white">Môn học:</span> <Pill>Toán Học</Pill></li>
                <li>• <span className="font-semibold text-white">Lớp:</span> <Pill>10</Pill></li>
                <li>• <span className="font-semibold text-white">Chủ đề/Chương:</span> <Pill>Chương 1: Mệnh đề và Tập hợp</Pill></li>
                <li>• <span className="font-semibold text-white">Bài học:</span> <Pill>[Nhập tên bài học]</Pill></li>
                <li>• <span className="font-semibold text-white">Thời lượng giảng dạy:</span> <Pill>[Nhập số tiết]</Pill></li>
                <li>• <span className="font-semibold text-white">Mức độ kiến thức:</span> <Pill>[CƠ BẢN / TRUNG BÌNH / NÂNG CAO]</Pill></li>
                <li>• <span className="font-semibold text-white">Loại bài kiểm tra:</span> <Pill>[15 phút / 45 phút / Học kỳ / Tự chọn]</Pill></li>
                <li>• <span className="font-semibold text-white">Hình thức kiểm tra:</span> <Pill>[TỰ LUẬN / TRẮC NGHIỆM / HỖN HỢP]</Pill></li>
                <li className="pl-4">- <span className="font-semibold text-white">Nếu là Hỗn hợp, ghi rõ:</span> <Pill>[Ví dụ: 70% trắc nghiệm, 30% tự luận hoặc 7 câu trắc nghiệm, 3 câu tự luận]</Pill></li>
                <li>• <span className="font-semibold text-white">Số lượng câu hỏi:</span> <Pill>[Nhập tổng số câu]</Pill></li>
                <li>• <span className="font-semibold text-white">Thang điểm:</span> <Pill>[Nhập tổng điểm, ví dụ: 10]</Pill></li>
                <li>• <span className="font-semibold text-white">Yêu cầu bổ sung:</span> <Pill>[Mô tả: 2 phiên bản đề, ma trận đề, rubric chi tiết...]</Pill></li>
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
                onClick={handleCopy}
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
  )
}

export default PromptTemplate10Chuong1