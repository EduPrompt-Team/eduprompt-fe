import React from 'react'

const PromptTemplate10Chuong2: React.FC = () => {
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

  const [model, setModel] = React.useState('2.5 Pro')

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

  type ExampleData = {
    role: string
    task: string
    subject: string
    grade: string
    topic: string
    lesson: string
    duration: string
    level: string
    testType: string
    form: string
    questionCount: string
    totalScore: string
    additional: string
  }

  const ExampleBlock: React.FC<{ data: ExampleData }> = ({ data }) => (
    <div className="space-y-4">
      <p className="text-sm text-neutral-300"><span className="font-semibold text-white">Vai trò:</span> {data.role}</p>
      <p className="text-sm text-neutral-300"><span className="font-semibold text-white">Nhiệm vụ:</span> {data.task}</p>
      <h4 className="text-sm font-semibold text-white">THÔNG TIN ĐẦU VÀO</h4>
      <ul className="space-y-3 text-sm text-neutral-300">
        <li>• <span className="font-semibold text-white">Môn học:</span> <Pill>{data.subject}</Pill></li>
        <li>• <span className="font-semibold text-white">Lớp:</span> <Pill>{data.grade}</Pill></li>
        <li>• <span className="font-semibold text-white">Chủ đề/Chương:</span> <Pill>{data.topic}</Pill></li>
        <li>• <span className="font-semibold text-white">Bài học:</span> <Pill>{data.lesson}</Pill></li>
        <li>• <span className="font-semibold text-white">Thời lượng giảng dạy:</span> <Pill>{data.duration}</Pill></li>
        <li>• <span className="font-semibold text-white">Mức độ kiến thức:</span> <Pill>{data.level}</Pill></li>
        <li>• <span className="font-semibold text-white">Loại bài kiểm tra:</span> <Pill>{data.testType}</Pill></li>
        <li>• <span className="font-semibold text-white">Hình thức kiểm tra:</span> <Pill>{data.form}</Pill></li>
        <li>• <span className="font-semibold text-white">Số lượng câu hỏi:</span> <Pill>{data.questionCount}</Pill></li>
        <li>• <span className="font-semibold text-white">Thang điểm:</span> <Pill>{data.totalScore}</Pill></li>
        <li>• <span className="font-semibold text-white">Yêu cầu bổ sung:</span> <Pill>{data.additional}</Pill></li>
      </ul>
      <h4 className="text-sm font-semibold text-white">YÊU CẦU BẮT BUỘC</h4>
      <ol className="list-decimal ml-5 space-y-2 text-sm text-neutral-300">
        <li>Tuân thủ đủ 3 phần, dùng đúng mẫu mục con.</li>
        <li>Nếu trắc nghiệm: 4 phương án A–D và đúng 1 phương án. Nếu tự luận: có đáp án chi tiết và biểu điểm. Nếu hỗn hợp: tách rõ hai phần.</li>
      </ol>
    </div>
  )

  const example2Data: ExampleData = {
    role: 'Bạn là một giáo viên THPT, có chuyên môn trong việc thiết kế giáo án và tài liệu dạy học.',
    task: 'Tạo bộ tài liệu hoàn chỉnh gồm 3 phần: PHẦN 1: GIÁO ÁN HỌC TẬP; PHẦN 2: TÀI LIỆU HỖ TRỢ; PHẦN 3: ĐỀ THI.',
    subject: 'Toán Học',
    grade: '10',
    topic: 'Chương 1: Mệnh đề và Tập hợp',
    lesson: 'Bài 2: Tập Hợp',
    duration: '1 tiết',
    level: 'CƠ BẢN',
    testType: '45 phút',
    form: 'TRẮC NGHIỆM',
    questionCount: '10 câu',
    totalScore: '10 điểm',
    additional: '2 phiên bản đề, rubric chi tiết',
  }

  const example1Data: ExampleData = {
    role: 'Bạn là một giáo viên THPT, có chuyên môn trong việc thiết kế giáo án và tài liệu dạy học.',
    task: 'Tạo bộ tài liệu hoàn chỉnh gồm 3 phần: PHẦN 1: GIÁO ÁN HỌC TẬP; PHẦN 2: TÀI LIỆU HỖ TRỢ; PHẦN 3: ĐỀ THI.',
    subject: 'Toán Học ',
    grade: '10 ',
    topic: 'Chương 1: Mệnh đề và Tập hợp ',
    lesson: 'Bài 1: Mệnh đề ',
    duration: '1 tiết ',
    level: 'CƠ BẢN ',
    testType: '15 phút ',
    form: 'TRẮC NGHIỆM',
    questionCount: '10 câu',
    totalScore: '10 điểm',
    additional: '2 phiên bản, có ma trận đề',
  }
  const example3Data: ExampleData = {
    role: 'Bạn là một giáo viên THPT, có chuyên môn trong việc thiết kế giáo án và tài liệu dạy học.',
    task: 'Tạo bộ tài liệu hoàn chỉnh gồm 3 phần: PHẦN 1: GIÁO ÁN HỌC TẬP; PHẦN 2: TÀI LIỆU HỖ TRỢ; PHẦN 3: ĐỀ THI.',
    subject: 'Toán Học ',
    grade: '10 ',
    topic: 'Chương 1: Mệnh đề và Tập hợp ',
    lesson: 'Bài 3: Các phép toán tập hợp ',
    duration: '1 tiết ',
    level: 'NÂNG CAO ',
    testType: '15 phút ',
    form: 'TRẮC NGHIỆM',
    questionCount: '10 câu',
    totalScore: '10 điểm',
    additional: '2 phiên bản, có ma trận đề',
  }
  const example4Data: ExampleData = {
    role: 'Bạn là một giáo viên THPT, có chuyên môn trong việc thiết kế giáo án và tài liệu dạy học.',
    task: 'Tạo bộ tài liệu hoàn chỉnh gồm 3 phần: PHẦN 1: GIÁO ÁN HỌC TẬP; PHẦN 2: TÀI LIỆU HỖ TRỢ; PHẦN 3: ĐỀ THI.',
    subject: 'Toán Học ',
    grade: '10 ',
    topic: 'Chương 1: Mệnh đề và Tập hợp ',
    lesson: 'Bài Tập Cuối Chương 1',
    duration: '1 tiết ',
    level: 'TRUNG BÌNH ',
    testType: '45 phút ',
    form: 'TRẮC NGHIỆM ',
    questionCount: '10 câu',
    totalScore: '10 điểm',
    additional: '4 phiên bản, có ma trận đề',
  }

  // Example 2 - rich formatted description content for the right-hand panel
  const example2Rich: React.ReactNode = (
    <div className="text-sm text-neutral-200 leading-relaxed space-y-3">
      <h3 className="text-white text-base font-semibold">PHẦN 1: GIÁO ÁN HỌC TẬP</h3>
      <h4 className="text-white font-semibold">GIÁO ÁN BÀI 2: TẬP HỢP</h4>
      <p>Môn học: <span className="font-semibold">Toán Học</span> - Lớp 10<br/>Chương 1: Mệnh đề và Tập hợp<br/>Thời lượng: 1 tiết (45 phút)</p>

      <h4 className="text-white font-semibold">I. MỤC TIÊU BÀI HỌC</h4>
      <div>
        <p className="text-white font-semibold">Kiến thức:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Hiểu được khái niệm tập hợp, phần tử của tập hợp.</li>
          <li>Nắm được các cách xác định một tập hợp (liệt kê phần tử, chỉ ra tính chất đặc trưng).</li>
          <li>Hiểu khái niệm tập hợp rỗng (∅).</li>
          <li>Hiểu khái niệm tập hợp con (⊂) và hai tập hợp bằng nhau.</li>
          <li>Nắm các phép toán cơ bản trên tập hợp: hợp (∪), giao (∩), hiệu (\), phần bù.</li>
        </ul>
      </div>
      <div>
        <p className="text-white font-semibold">Kỹ năng:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Sử dụng đúng các ký hiệu ∈, ∉, ⊂, ∅, ∪, ∩, \.</li>
          <li>Xác định một tập hợp bằng hai cách.</li>
          <li>Kiểm tra quan hệ tập con giữa các tập hợp.</li>
          <li>Thực hiện thành thạo các phép toán trên các tập hợp cụ thể.</li>
          <li>Vận dụng biểu đồ Ven minh họa khái niệm và phép toán.</li>
        </ul>
      </div>
      <div>
        <p className="text-white font-semibold">Thái độ:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Cẩn thận, chính xác trong tính toán và ký hiệu.</li>
          <li>Phát triển tư duy logic, trừu tượng.</li>
          <li>Tích cực tham gia hoạt động học tập.</li>
        </ul>
      </div>
      <div>
        <p className="text-white font-semibold">Năng lực hình thành:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Năng lực tư duy và lập luận toán học.</li>
          <li>Năng lực mô hình hóa toán học (biểu đồ Ven).</li>
          <li>Năng lực giải quyết vấn đề và giao tiếp toán học.</li>
        </ul>
      </div>

      <h4 className="text-white font-semibold">II. CHUẨN BỊ</h4>
      <ul className="list-disc ml-5 space-y-1">
        <li><span className="font-semibold">Giáo viên:</span> SGK, giáo án, bảng/bút, máy chiếu (nếu có), phiếu học tập.</li>
        <li><span className="font-semibold">Học sinh:</span> SGK, vở ghi, đồ dùng học tập.</li>
      </ul>

      <h4 className="text-white font-semibold">III. TIẾN TRÌNH DẠY HỌC</h4>
      <ul className="space-y-2">
        <li>
          <p className="text-white font-semibold">Thời gian: 1 phút — Hoạt động: Ổn định lớp</p>
          <p>Nội dung: GV chào lớp, kiểm tra sĩ số.</p>
        </li>
        <li>
          <p className="text-white font-semibold">Thời gian: 4 phút — Hoạt động: Kiểm tra bài cũ</p>
          <p>Nội dung: HS trả lời câu hỏi về mệnh đề; GV nhận xét và dẫn dắt.</p>
        </li>
        <li>
          <p className="text-white font-semibold">Thời gian: 30 phút — Hoạt động: Bài mới</p>
          <div className="space-y-2">
            <p className="font-semibold">1) Khái niệm tập hợp</p>
            <ul className="list-disc ml-5"><li>Tập hợp, phần tử; ký hiệu ∈, ∉.</li></ul>
            <p className="font-semibold">2) Cách xác định tập hợp</p>
            <ul className="list-disc ml-5"><li>Liệt kê phần tử.</li><li>Chỉ ra tính chất đặc trưng.</li></ul>
            <p className="font-semibold">3) Tập hợp rỗng (∅)</p>
            <p className="font-semibold">4) Tập hợp con, hai tập hợp bằng nhau</p>
            <ul className="list-disc ml-5"><li>A ⊂ B ⇔ ∀x, x ∈ A ⇒ x ∈ B.</li><li>A = B ⇔ A ⊂ B và B ⊂ A.</li></ul>
            <p className="font-semibold">5) Các phép toán</p>
            <ul className="list-disc ml-5">
              <li>Hợp: A ∪ B = {'{'}x | x ∈ A hoặc x ∈ B{'}'}.</li>
              <li>Giao: A ∩ B = {'{'}x | x ∈ A và x ∈ B{'}'}.</li>
              <li>Hiệu: A \\ B = {'{'}x | x ∈ A và x ∉ B{'}'}.</li>
            </ul>
          </div>
        </li>
        <li>
          <p className="text-white font-semibold">Thời gian: 8 phút — Hoạt động: Củng cố</p>
          <p>BT nhanh: A = {'{'}1; 2; 3; 4{'}'}, B = {'{'}3; 4; 5; 6{'}'}. Tính A ∪ B, A ∩ B, A \\ B, B \\ A.</p>
        </li>
        <li>
          <p className="text-white font-semibold">Thời gian: 2 phút — Hoạt động: Dặn dò</p>
          <p>HS học bài, làm BT SGK; thông báo kiểm tra 45 phút.</p>
        </li>
      </ul>

      <h4 className="text-white font-semibold">IV. RÚT KINH NGHIỆM</h4>
      <p>(GV ghi chú sau khi kết thúc buổi dạy)</p>

      <h3 className="text-white text-base font-semibold">PHẦN 2: TÀI LIỆU HỖ TRỢ</h3>
      <p className="text-white font-semibold">A. Sơ đồ tư duy</p>
      <ul className="list-decimal ml-5 space-y-1">
        <li>Khái niệm cơ bản: Tập hợp; Phần tử (∈, ∉); Tập rỗng (∅)</li>
        <li>Cách xác định: Liệt kê; Tính chất đặc trưng</li>
        <li>Quan hệ: Tập con (⊂); Hai tập hợp bằng nhau</li>
        <li>Các phép toán: ∪, ∩, \</li>
      </ul>
      <p className="text-white font-semibold">B. Bảng thuật ngữ</p>
      <ul className="space-y-1 ml-5 list-disc">
        <li>Phần tử thuộc (∈): a ∈ A</li>
        <li>Phần tử không thuộc (∉): b ∉ A</li>
        <li>Tập hợp con (⊂): A ⊂ B nếu mọi phần tử của A đều thuộc B</li>
        <li>Tập hợp rỗng (∅): Tập không chứa phần tử</li>
        <li>Phép hợp (∪): A ∪ B gồm phần tử thuộc A hoặc B</li>
        <li>Phép giao (∩): A ∩ B gồm phần tử thuộc cả A và B</li>
        <li>Phép hiệu (\): A \ B gồm phần tử thuộc A nhưng không thuộc B</li>
      </ul>
      <p className="text-white font-semibold">C. Ví dụ minh họa</p>
      <ul className="list-decimal ml-5 space-y-1">
        <li>
          Xác định tập hợp: A = {'{'}0; 2; 4; 6; 8{'}'} = {'{'}x ∈ N | x &lt; 10 và x chẵn{'}'}
        </li>
        <li>Tập con: A = {'{'}1; 2{'}'} ⇒ các tập con: ∅, {'{'}1{'}'}, {'{'}2{'}'}, {'{'}1; 2{'}'}</li>
        <li>Phép toán: X = {'{'}a, b, c, d{'}'}, Y = {'{'}c, d, e, f{'}'}: X ∪ Y = {'{'}a, b, c, d, e, f{'}'}; X ∩ Y = {'{'}c, d{'}'}; X \\ Y = {'{'}a, b{'}'}; Y \\ X = {'{'}e, f{'}'}</li>
      </ul>
      <p className="text-white font-semibold">D. Bài tập tự luyện (có đáp án)</p>
      <ul className="list-decimal ml-5 space-y-1">
        <li>Viết M = {'{'}x ∈ Z | -2 &lt; x ≤ 3{'}'} dưới dạng liệt kê.</li>
        <li>Cho A = {'{'}1; 3; 5{'}'}. Khẳng định sai? …</li>
        <li>Cho A = {'{'}x ∈ N | x ≤ 4{'}'}, B = {'{'}0; 2; 4; 6{'}'}. Tìm A ∩ B…</li>
      </ul>

      <h3 className="text-white text-base font-semibold">PHẦN 3: ĐỀ THI</h3>
      <p className="font-semibold">Bài kiểm tra 45 phút — Chương 1 (Bài 2: Tập hợp)</p>
      <p className="text-white font-semibold">Đề số 1</p>
      <ol className="list-decimal ml-5 space-y-1">
        <li>Ký hiệu nào đúng cho mệnh đề: "3 là một số tự nhiên"? — A) 3 ⊂ N; B) 3 ∈ N; C) 3 &lt; N; D) 3 ≤ N</li>
        <li>Cho A = {'{'}1; 2; 3; 4; x; y{'}'}. Khẳng định đúng? — A) 5 ∈ A; B) {'{'}1; 2; 3{'}'} ⊂ A; C) x ⊂ A; D) A = {'{'}1; 2; 3; 4{'}'}</li>
        <li>Viết tập P gồm các chữ cái trong "THÀNH PHỐ". — A) {'{'}T, H, A, N, P, O{'}'}; B) {'{'}T, H, A, N, H, P, H, O{'}'}; C) {'{'}T, H, A, N, P, H, O{'}'}; D) {'{'}T, H, À, N, P, H, Ố{'}'}</li>
        <li>Cho A = {'{'}x ∈ N | x ≤ 5{'}'}. Viết dạng liệt kê: — A) {'{'}1; 2; 3; 4; 5{'}'}; B) {'{'}0; 1; 2; 3; 4; 5{'}'}; C) {'{'}0; 1; 2; 3; 4{'}'}; D) {'{'}1; 2; 3; 4{'}'}</li>
        <li>Tập hợp rỗng là tập nào? — A) {'{'}x ∈ Z | x² = 0{'}'}; B) {'{'}x ∈ Q | x² = 2{'}'}; C) {'{'}x ∈ R | x² − 5x + 6 = 0{'}'}; D) {'{'}x ∈ N | x &lt; 1{'}'}</li>
        <li>Tập A = {'{'}1; 2{'}'} có bao nhiêu tập con? — A) 1; B) 2; C) 3; D) 4</li>
        <li>Với A = {'{'}1; 3; 5{'}'} và B = {'{'}1; 2; 3{'}'}, A ∪ B là: — A) {'{'}1; 2; 3; 5{'}'}; B) {'{'}1; 3{'}'}; C) {'{'}2; 5{'}'}; D) {'{'}1; 1; 2; 3; 3; 5{'}'}</li>
        <li>Với X = {'{'}a, b, c{'}'} và Y = {'{'}b, c, d{'}'}, X ∩ Y là: — A) {'{'}a{'}'}; B) {'{'}d{'}'}; C) {'{'}b, c{'}'}; D) {'{'}a, b, c, d{'}'}</li>
        <li>A = {'{'}0; 1; 2; 3; 4{'}'}; B = {'{'}2; 3; 4; 5; 6{'}'}. A \\ B là: — A) {'{'}0; 1{'}'}; B) {'{'}2; 3; 4{'}'}; C) {'{'}5; 6{'}'}; D) {'{'}0; 1; 5; 6{'}'}</li>
        <li>A = {'{'}0; 1; 2; 3; 4{'}'}; B = {'{'}2; 3; 4; 5; 6{'}'}. B \\ A là: — A) {'{'}0; 1{'}'}; B) {'{'}2; 3; 4{'}'}; C) {'{'}5; 6{'}'}; D) {'{'}0; 1; 5; 6{'}'}</li>
      </ol>

      <p className="text-white font-semibold mt-4">Đề số 2</p>
      <ol className="list-decimal ml-5 space-y-1">
        <li>"√2 không phải là số hữu tỉ" viết đúng: — A) √2 ∈ Q; B) √2 ⊂ Q; C) √2 ∉ Q; D) Q ∉ √2</li>
        <li>Cho M = {'{'}a; b; 5; 9{'}'}. Khẳng định sai: — A) a ∈ M; B) {'{'}b; 5{'}'} ⊂ M; C) 9 = M; D) ∅ ⊂ M</li>
        <li>Viết Q gồm các chữ cái của "HỌC TẬP": — A) {'{'}H, O, C, T, A, P{'}'}; B) {'{'}H, O, C, T, Â, P{'}'}; C) {'{'}H, O, C, T, A, P, H, O, C{'}'}; D) {'{'}H, O, C{'}'}</li>
        <li>Cho B = {'{'}x ∈ N* | x &lt; 4{'}'}. B dạng liệt kê là: — A) {'{'}1; 2; 3; 4{'}'}; B) {'{'}0; 1; 2; 3{'}'}; C) {'{'}1; 2; 3{'}'}; D) {'{'}0; 1; 2{'}'}</li>
        <li>Tập hợp rỗng: — A) {'{'}x ∈ Z | x² = 9{'}'}; B) {'{'}x ∈ R | x² + x + 1 = 0{'}'}; C) {'{'}x ∈ Q | x = 1{'}'}; D) {'{'}x ∈ N | 2x − 1 = 3{'}'}</li>
        <li>Với A = {'{'}a, b, c{'}'} có bao nhiêu tập con? — A) 3; B) 6; C) 8; D) 9</li>
        <li>A = {'{'}2; 4; 6{'}'}, B = {'{'}1; 2; 3; 4{'}'}. A ∪ B: — A) {'{'}1; 2; 3; 4; 6{'}'}; B) {'{'}2; 4{'}'}; C) {'{'}1; 3; 6{'}'}; D) {'{'}1; 2; 3; 4; 2; 4; 6{'}'}</li>
        <li>M = {'{'}1, 5, 7{'}'}, N = {'{'}1, 3, 5{'}'}. M ∩ N: — A) {'{'}1, 3, 5, 7{'}'}; B) {'{'}1, 5{'}'}; C) {'{'}3, 7{'}'}; D) {'{'}7{'}'}</li>
        <li>C = {'{'}a, b, c, d{'}'}, D = {'{'}a, c, e{'}'}. C \\ D là: — A) {'{'}e{'}'}; B) {'{'}a, c{'}'}; C) {'{'}b, d{'}'}; D) {'{'}b, d, e{'}'}</li>
        <li>C = {'{'}a, b, c, d{'}'}, D = {'{'}a, c, e{'}'}. D \\ C là: — A) {'{'}e{'}'}; B) {'{'}a, c{'}'}; C) {'{'}b, d{'}'}; D) {'{'}b, d, e{'}'}</li>
      </ol>

      <p className="text-white font-semibold mt-4">Đáp án và rubric chấm điểm</p>
      <div className="space-y-2">
        <p><span className="font-semibold">Đáp án (10 câu ví dụ):</span><br/>
          Đề 1: 1-B, 2-B, 3-A, 4-B, 5-B, 6-D, 7-A, 8-C, 9-A, 10-C<br/>
          Đề 2: 1-C, 2-C, 3-A, 4-C, 5-B, 6-C, 7-A, 8-B, 9-C, 10-A
        </p>
        <ul className="list-disc ml-5">
          <li>Hình thức: Trắc nghiệm khách quan. Thang điểm: 10.</li>
          <li>Tổng số câu: 40. Mỗi câu đúng: 10 / 40 = 0.25 điểm. Sai/không trả lời: 0 điểm.</li>
          <li><span className="font-semibold">Công thức:</span> Tổng điểm = (số câu đúng) × 0.25.</li>
        </ul>
      </div>
    </div>
  )

  // Example 1 - rich formatted lesson plan for "Bài 1: Mệnh đề"
  const example1Rich: React.ReactNode = (
    <div className="text-sm text-neutral-200 leading-relaxed space-y-3">
      <h3 className="text-white text-base font-semibold">PHẦN 1: GIÁO ÁN HỌC TẬP</h3>
      <h4 className="text-white font-semibold">GIÁO ÁN BÀI 1: MỆNH ĐỀ</h4>
      <p>Môn học: <span className="font-semibold">Toán Học</span> - Lớp 10<br/>Chương 1: Mệnh đề và Tập hợp<br/>Thời lượng: 1 tiết (45 phút)</p>

      <h4 className="text-white font-semibold">I. MỤC TIÊU BÀI HỌC</h4>
      <div>
        <p className="text-white font-semibold">Kiến thức:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Nêu được định nghĩa mệnh đề, nhận biết một câu có phải là mệnh đề hay không.</li>
          <li>Hiểu mệnh đề phủ định, mệnh đề chứa biến.</li>
          <li>Hiểu và sử dụng các ký hiệu lượng từ: ∀ (với mọi), ∃ (tồn tại).</li>
          <li>Nắm cách phủ định mệnh đề có chứa lượng từ.</li>
        </ul>
      </div>
      <div>
        <p className="text-white font-semibold">Kỹ năng:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Xác định tính đúng/sai của mệnh đề đơn giản.</li>
          <li>Lập mệnh đề phủ định cho mệnh đề đã cho.</li>
          <li>Viết mệnh đề bằng ký hiệu ∀, ∃ và phủ định đúng.</li>
        </ul>
      </div>
      <div>
        <p className="text-white font-semibold">Thái độ:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Rèn tư duy logic, lập luận chặt chẽ; cẩn thận khi dùng ký hiệu.</li>
          <li>Tích cực tham gia xây dựng bài.</li>
        </ul>
      </div>
      <div>
        <p className="text-white font-semibold">Năng lực hình thành:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Năng lực tư duy và lập luận toán học; giao tiếp toán học; giải quyết vấn đề.</li>
        </ul>
      </div>

      <h4 className="text-white font-semibold">II. CHUẨN BỊ</h4>
      <ul className="list-disc ml-5 space-y-1">
        <li><span className="font-semibold">Giáo viên:</span> SGK, giáo án, bảng/bút, phiếu học tập.</li>
        <li><span className="font-semibold">Học sinh:</span> SGK, vở ghi, đọc trước bài ở nhà.</li>
      </ul>

      <h4 className="text-white font-semibold">III. TIẾN TRÌNH DẠY HỌC</h4>
      <ul className="space-y-2">
        <li>
          <p className="text-white font-semibold">Hoạt động 1 — 1 phút: Ổn định lớp</p>
          <p>GV chào lớp, kiểm tra sĩ số.</p>
        </li>
        <li>
          <p className="text-white font-semibold">Hoạt động 2 — 4 phút: Vào bài mới</p>
          <p>GV đưa ra một vài câu nói đời sống và hỏi câu nào có thể xác định đúng/sai. HS thảo luận, GV dẫn dắt vào bài.</p>
        </li>
        <li>
          <p className="text-white font-semibold">Hoạt động 3 — 30 phút: Bài mới</p>
          <div className="space-y-2">
            <p className="font-semibold">1) Mệnh đề và mệnh đề chứa biến</p>
            <ul className="list-disc ml-5"><li>Định nghĩa “khẳng định”, “đúng hoặc sai”; ví dụ. Giới thiệu mệnh đề chứa biến.</li></ul>
            <p className="font-semibold">2) Mệnh đề phủ định</p>
            <ul className="list-disc ml-5"><li>Ký hiệu P̄; quy tắc về tính đúng/sai; HS thực hành.</li></ul>
            <p className="font-semibold">3) Ký hiệu lượng từ ∀, ∃</p>
            <ul className="list-disc ml-5"><li>Giới thiệu ∀ (với mọi), ∃ (tồn tại); chuyển đổi giữa lời văn và ký hiệu.</li></ul>
            <p className="font-semibold">4) Phủ định mệnh đề có ∀, ∃</p>
            <ul className="list-disc ml-5"><li>Quy tắc: phủ định của ∀ là ∃ và ngược lại; đồng thời phủ định mệnh đề P(x) bên trong.</li></ul>
          </div>
        </li>
        <li>
          <p className="text-white font-semibold">Hoạt động 4 — 8 phút: Củng cố</p>
          <p>BT nhanh: nhận biết mệnh đề, xét đúng/sai, lập phủ định, dùng lượng từ.</p>
        </li>
        <li>
          <p className="text-white font-semibold">Hoạt động 5 — 2 phút: Dặn dò</p>
          <p>HS học bài, làm BT SGK; thông báo kiểm tra 15 phút ở tiết sau.</p>
        </li>
      </ul>

      <h4 className="text-white font-semibold">IV. RÚT KINH NGHIỆM</h4>
      <p>(GV tự ghi chú sau buổi dạy)</p>

      <h3 className="text-white text-base font-semibold">PHẦN 2: TÀI LIỆU HỖ TRỢ</h3>
      <p className="text-white font-semibold">A. Sơ đồ tư duy</p>
      <ul className="list-decimal ml-5 space-y-1">
        <li>Mệnh đề: là câu khẳng định; có tính Đúng hoặc Sai; không thể vừa đúng vừa sai.</li>
        <li>Phân loại & thành phần: mệnh đề chứa biến; mệnh đề phủ định P̄.</li>
        <li>Mệnh đề lượng từ: ∀ (với mọi); ∃ (tồn tại).</li>
        <li>Phủ định logic: đổi ∀ ↔ ∃ và phủ định P(x).</li>
      </ul>
      <p className="text-white font-semibold">B. Phân biệt mệnh đề và câu không phải mệnh đề</p>
      <ul className="ml-5 space-y-1 list-disc">
        <li>Mệnh đề: câu khẳng định; có tính đúng/sai. Ví dụ: “Trái Đất quay quanh Mặt Trời.” (đúng), “2+3=6.” (sai).</li>
        <li>Câu không phải mệnh đề: câu hỏi/cảm thán/mệnh lệnh; không có tính đúng/sai. Ví dụ: “Hôm nay là thứ mấy?”, “Hãy làm bài tập đi!”.</li>
      </ul>
      <p className="text-white font-semibold">C. Ví dụ minh họa</p>
      <ul className="list-decimal ml-5 space-y-1">
        <li>Nhận biết mệnh đề: “Số 11 là số nguyên tố.” (mệnh đề đúng); “x + 5 = 2” (mệnh đề chứa biến); “Mệt mỏi quá!” (không phải mệnh đề).</li>
        <li>Phủ định mệnh đề: P: “Hà Nội là thủ đô của Việt Nam.” ⇒ P̄: “Hà Nội không phải là thủ đô của Việt Nam.”</li>
        <li>Phủ định lượng từ: P: “∃x ∈ N | x + 1 = 0” ⇒ P̄: “∀x ∈ N, x + 1 ≠ 0”.</li>
      </ul>
      <p className="text-white font-semibold">D. Bài tập tự luyện (có đáp án)</p>
      <ul className="list-decimal ml-5 space-y-1">
        <li>Trong các câu: a) Huế là một thành phố của Việt Nam. b) Sông Hương chảy ngang qua TP Huế. c) Bạn đã đến Huế chưa? d) Hãy đi du lịch Huế! — câu nào là mệnh đề?</li>
        <li>Xét đúng/sai và lập phủ định: a) P: “x² − 3x + 2 = 0 có nghiệm”. b) Q: “17 là số chẵn”.</li>
        <li>Viết bằng lượng từ: “Có một số thực nhỏ hơn nghịch đảo của nó”. Gợi ý: ∃x ∈ R, x &lt; 1/x.</li>
      </ul>

      <h3 className="text-white text-base font-semibold">PHẦN 3: ĐỀ THI</h3>
      <p className="font-semibold">Bài kiểm tra 15 phút — Chương 1 (Bài 1: Mệnh đề)</p>
      <p className="text-white font-semibold">A. Ma trận</p>
      <ul className="list-disc ml-5 space-y-1">
        <li>Chủ đề 1: Nhận biết mệnh đề, mệnh đề chứa biến — Nhận biết 2, Thông hiểu 1 (tổng 3 câu)</li>
        <li>Chủ đề 2: Mệnh đề phủ định — Nhận biết 1, Thông hiểu 1 (tổng 2 câu)</li>
        <li>Chủ đề 3: Ký hiệu ∀, ∃ — Nhận biết 1, Thông hiểu 2 (tổng 3 câu)</li>
        <li>Chủ đề 4: Phủ định mệnh đề có ∀, ∃ — Nhận biết 1, Thông hiểu 1 (tổng 2 câu)</li>
      </ul>
      <p className="text-white font-semibold">B. Đề thi — Đề số 1</p>
      <ol className="list-decimal ml-5 space-y-1">
        <li>Trong các câu sau, câu nào là mệnh đề? — A) 15 là một số nguyên tố. B) Bạn có đói không? C) Hôm nay lạnh thế! D) Hãy học bài đi.</li>
        <li>Câu nào sau đây không phải là mệnh đề? — A) 3 &lt; 1. B) 4 − 5 = 1. C) Bạn tên là gì? D) Tam giác đều có ba cạnh bằng nhau.</li>
        <li>Mệnh đề chứa biến “x² − 1 = 0” nhận giá trị đúng khi: — A) x = 0; B) x = 1; C) x = 2; D) x = 3.</li>
        <li>Phủ định của “Số 6 là số chẵn” là: — A) “Số 6 là số lẻ”; B) “Số 6 không là số chẵn”; C) “Số 6 chia hết cho 2”; D) “Số 6 là hợp số”.</li>
        <li>Phủ định P: “Nếu tam giác có hai góc 60° thì tam giác đó đều”: — A) “Có hai góc 60° và không đều”; B) “Không có hai góc 60° thì không đều”; C) “Đều và không có hai góc 60°”; D) “Nếu đều thì có hai góc 60°”.</li>
        <li>Ký hiệu ∀ đọc là: — A) Tồn tại; B) Với mọi; C) Suy ra; D) Tương đương.</li>
        <li>Viết bằng lượng từ: “Có ít nhất một số nguyên không chia hết cho chính nó”. — A) ∀x ∈ Z, x ⋮ x; B) ∃x ∈ Z, x không chia hết cho x; C) ∀x ∈ Z, x không chia hết cho x; D) ∃x ∈ Z, x ⋮ x.</li>
        <li>Mệnh đề đúng: — A) ∀x ∈ R, x &gt; 0; B) ∀x ∈ N, x² &gt; x; C) ∃x ∈ Z, x² = x; D) ∃x ∈ Q, x² = 3.</li>
        <li>Phủ định của “∀x ∈ R, x² &gt; 0”: — A) ∀x ∈ R, x² ≤ 0; B) ∃x ∈ R, x² &gt; 0; C) ∃x ∈ R, x² ≤ 0; D) ∀x ∈ R, x² &lt; 0.</li>
        <li>Phủ định của “∃x ∈ N | 2x − 1 = 0”: — A) ∃x ∈ N | 2x − 1 ≠ 0; B) ∀x ∈ N, 2x − 1 = 0; C) ∀x ∈ N, 2x − 1 ≠ 0; D) ∃x ∉ N | 2x − 1 = 0.</li>
      </ol>
      <p className="text-white font-semibold">B. Đề thi — Đề số 2</p>
      <ol className="list-decimal ml-5 space-y-1">
        <li>Trong các câu sau, câu nào là mệnh đề? — A) Thời tiết đẹp quá! B) 2 + 8 = 10. C) Bạn đang làm gì vậy? D) Cố lên!</li>
        <li>Câu nào không phải mệnh đề? — A) Paris là thủ đô của Anh. B) 5 − 3 &gt; 0. C) Mấy giờ rồi? D) Hình vuông có bốn góc vuông.</li>
        <li>Mệnh đề chứa biến “x² = 4” đúng khi: — A) x = 0; B) x = 1; C) x = −2; D) x = 4.</li>
        <li>Phủ định của “π là số hữu tỉ”: — A) “π không là số hữu tỉ”; B) “π là số nguyên”; C) “π là số tự nhiên”; D) “π = 3.14”.</li>
        <li>Phủ định P: “2 là số nguyên tố chẵn duy nhất”: — A) “2 không là số nguyên tố chẵn duy nhất”; B) “Mọi số nguyên tố đều chẵn”; C) “2 là số nguyên tố lẻ”; D) “Tồn tại số nguyên tố chẵn khác 2”.</li>
        <li>Ký hiệu ∃ đọc là: — A) Với mọi; B) Kéo theo; C) Tồn tại; D) Khi và chỉ khi.</li>
        <li>Viết bằng lượng từ: “Mọi số thực cộng với 0 đều bằng chính nó”: — A) ∃x ∈ R, x + 0 = x; B) ∀x ∈ R, x + 0 ≠ x; C) ∃x ∈ R, x + 0 = 0; D) ∀x ∈ R, x + 0 = x.</li>
        <li>Mệnh đề sai: — A) ∃x ∈ N, x + 3 = 1; B) ∃x ∈ Z, x² − 4 = 0; C) ∀x ∈ R, x² ≥ 0; D) ∀x ∈ N*, x &gt; 0.</li>
        <li>Phủ định của “∃x ∈ R, x &lt; 0”: — A) ∃x ∈ R, x ≥ 0; B) ∀x ∈ R, x &lt; 0; C) ∀x ∈ R, x ≥ 0; D) ∃x ∈ R, x &gt; 0.</li>
        <li>Phủ định của “∀x ∈ Q, x² − 2 ≠ 0”: — A) ∀x ∈ Q, x² − 2 = 0; B) ∃x ∈ Q | x² − 2 = 0; C) ∃x ∉ Q | x² − 2 = 0; D) ∃x ∈ Q | x² − 2 ≠ 0.</li>
      </ol>
      <p className="text-white font-semibold">C. Đáp án</p>
      <p>Đề 1: 1A, 2C, 3B, 4B, 5A, 6B, 7B, 8C, 9C, 10C.<br/>Đề 2: 1B, 2C, 3C, 4A, 5A, 6C, 7D, 8A, 9C, 10B.</p>
    </div>
  )

  // Example 3 - rich formatted for "Bài 3: Các phép toán tập hợp (Nâng cao)"
  const example3Rich: React.ReactNode = (
    <div className="text-sm text-neutral-200 leading-relaxed space-y-3">
      <h3 className="text-white text-base font-semibold">PHẦN 1: GIÁO ÁN HỌC TẬP</h3>
      <h4 className="text-white font-semibold">GIÁO ÁN BÀI 3: CÁC PHÉP TOÁN TẬP HỢP (NÂNG CAO)</h4>
      <p>Môn học: <span className="font-semibold">Toán Học</span> - Lớp 10<br/>Chương 1: Mệnh đề và Tập hợp<br/>Thời lượng: 1 tiết (45 phút)</p>

      <h4 className="text-white font-semibold">I. MỤC TIÊU BÀI HỌC</h4>
      <div>
        <p className="text-white font-semibold">Kiến thức:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Củng cố và vận dụng thành thạo các phép toán giao, hợp, hiệu trên các tập hợp là khoảng/đoạn/nửa khoảng trên R.</li>
          <li>Nắm vững khái niệm và cách xác định phần bù (complement) của một tập hợp con.</li>
          <li>Hiểu và áp dụng công thức n(A ∪ B) = n(A) + n(B) − n(A ∩ B).</li>
          <li>Làm quen với các bài toán tham số về điều kiện của giao/tập con…</li>
        </ul>
      </div>
      <div>
        <p className="text-white font-semibold">Kỹ năng:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Biểu diễn chính xác các tập hợp trên trục số và thao tác tìm ∪, ∩, \.</li>
          <li>Tìm phần bù trong R: C_R A = R \ A.</li>
          <li>Vận dụng linh hoạt phép toán tập hợp để đếm số phần tử và xử lý tham số.</li>
        </ul>
      </div>
      <div>
        <p className="text-white font-semibold">Thái độ:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Cẩn thận với đầu mút [ ], ( ). Chủ động trước bài toán phức tạp.</li>
          <li>Thấy mối liên kết giữa ngôn ngữ tập hợp với bất phương trình, hệ phương trình…</li>
        </ul>
      </div>
      <div>
        <p className="text-white font-semibold">Năng lực hình thành:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Tư duy và lập luận toán học; giải quyết vấn đề; mô hình hóa; sử dụng công cụ (trục số).</li>
        </ul>
      </div>

      <h4 className="text-white font-semibold">II. CHUẨN BỊ</h4>
      <ul className="list-disc ml-5 space-y-1">
        <li><span className="font-semibold">Giáo viên:</span> SGK, giáo án, thước kẻ dài, phấn màu; sẵn ví dụ tham số điển hình.</li>
        <li><span className="font-semibold">Học sinh:</span> SGK, vở ghi, thước kẻ, bút màu; ôn tập các tập hợp số và phép toán cơ bản.</li>
      </ul>

      <h4 className="text-white font-semibold">III. TIẾN TRÌNH DẠY HỌC</h4>
      <ul className="space-y-2">
        <li>
          <p className="text-white font-semibold">Hoạt động 1 — 5 phút: Ổn định và kiểm tra bài cũ</p>
          <p>Ôn phép toán trên tập hữu hạn. Dẫn dắt câu hỏi: nếu là khoảng/đoạn trên R thì làm thế nào?</p>
        </li>
        <li>
          <p className="text-white font-semibold">Hoạt động 2 — 12 phút: Phép toán trên các tập con của R</p>
          <p>Quy trình trên trục số: (1) Vẽ trục; (2) Biểu diễn tập hợp; (3) Gạch bỏ theo định nghĩa phép toán. Ví dụ A = (-3; 5], B = [2; +∞): tìm A ∩ B, A ∪ B, A \ B.</p>
        </li>
        <li>
          <p className="text-white font-semibold">Hoạt động 3 — 8 phút: Phần bù</p>
          <p>Định nghĩa: nếu A ⊂ E, C_E A = E \ A; đặc biệt C_R A = R \ A. Ví dụ A = (-∞; 3) ⇒ C_R A = [3; +∞).</p>
        </li>
        <li>
          <p className="text-white font-semibold">Hoạt động 4 — 15 phút: Các bài toán nâng cao</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Dạng 1 (đếm phần tử): n(A ∪ B) = n(A) + n(B) − n(A ∩ B).</li>
            <li>Dạng 2 (tham số): ví dụ “Tìm m để A = (m; m+1) và B = (0; 2) có giao khác rỗng”.</li>
          </ul>
        </li>
        <li>
          <p className="text-white font-semibold">Hoạt động 5 — 5 phút: Củng cố và dặn dò</p>
          <p>Tóm tắt kiến thức; giao bài vận dụng cao; thông báo kiểm tra 15 phút tiết sau.</p>
        </li>
      </ul>

      <h4 className="text-white font-semibold">IV. RÚT KINH NGHIỆM</h4>
      <p>(GV tự ghi chú sau khi kết thúc)</p>

      <h3 className="text-white text-base font-semibold">PHẦN 2: TÀI LIỆU HỖ TRỢ</h3>
      <p className="text-white font-semibold">A. Sơ đồ tư duy (nâng cao)</p>
      <ul className="list-decimal ml-5 space-y-1">
        <li>Các phép toán trên tập con của R — công cụ trục số, lưu ý [ ], ( ).</li>
        <li>Phần bù: điều kiện A ⊂ E; C_E A = E \ A; trường hợp C_R A = R \ A.</li>
        <li>Bài toán ứng dụng: đếm phần tử; tham số dựa vị trí trên trục số.</li>
      </ul>
      <p className="text-white font-semibold">B. Công thức và nguyên lý</p>
      <ul className="ml-5 space-y-1 list-disc">
        <li>Nguyên lý bù trừ: n(A ∪ B) = n(A) + n(B) − n(A ∩ B).</li>
        <li>Nếu A = {'['}a; b{']'} ⇒ C_R A = (-∞; a) ∪ (b; +∞). Nếu A = {'('}a; b{')'} ⇒ C_R A = (-∞; a] ∪ [b; +∞).</li>
        <li>Tham số: tìm điều kiện để giao rỗng, rồi lấy phủ định để có giao khác rỗng.</li>
      </ul>
      <p className="text-white font-semibold">C. Ví dụ minh họa</p>
      <ul className="list-decimal ml-5 space-y-1">
        <li>Phép toán trên khoảng: A = (-∞; 4], B = (-2; 7) ⇒ A ∩ B = (-2; 4], A ∪ B = (-∞; 7).</li>
        <li>Phần bù: A = [-5; 10) ⇒ C_R A = (-∞; -5) ∪ [10; +∞).</li>
        <li>Tham số: m để A = [1; m+2] ⊂ B = [0; 5] ⇒ m ≤ 3.</li>
      </ul>
      <p className="text-white font-semibold">D. Bài tập tự luyện (có đáp án)</p>
      <ul className="list-decimal ml-5 space-y-1">
        <li>Cho A = [-4; 7], B = (-3; 5). Tính A ∩ B; A \ B.</li>
        <li>Cho E = {'{'}-2, -1, 0, 1, 2, 3, 4{'}'}, A = {'{'}-1, 0, 2{'}'}. Tính C_E A.</li>
        <li>Lớp có 45 HS; 25 thích Văn, 20 thích Toán, 10 thích cả hai. Hỏi số HS không thích môn nào?</li>
        <li>Tìm m để A = (m; m+2), B = [1; 3] có giao khác rỗng.</li>
      </ul>
      <p><span className="font-semibold">Đáp án:</span> A ∩ B = (-3; 5); A \ B = [-4; -3] ∪ [5; 7]. C_E A = {'{'}-2, 1, 3, 4{'}'}. Không thích môn nào: 10. Điều kiện giao khác rỗng: −1 &lt; m &lt; 3.</p>

      <h3 className="text-white text-base font-semibold">PHẦN 3: ĐỀ THI</h3>
      <p className="font-semibold">Bài kiểm tra 15 phút — Chương 1 (Nâng cao)</p>
      <p className="text-white font-semibold">A. Ma trận</p>
      <ul className="list-disc ml-5 space-y-1">
        <li>Chủ đề 1: Phép toán trên khoảng/đoạn — Nhận biết 1, Thông hiểu 2 (3 câu)</li>
        <li>Chủ đề 2: Phần bù — Nhận biết 1, Thông hiểu 1 (2 câu)</li>
        <li>Chủ đề 3: Tham số — Thông hiểu 2, Vận dụng thấp 1 (3 câu)</li>
        <li>Chủ đề 4: Đếm phần tử — Thông hiểu 1, Vận dụng thấp 1 (2 câu)</li>
      </ul>
      <p className="text-white font-semibold">B. Đề thi — Đề số 1</p>
      <ol className="list-decimal ml-5 space-y-1">
        <li>Cho A = [-1; 5), B = (2; 8). A ∩ B là: A) [-1; 8) B) (2; 5) C) [-1; 2] D) (5; 8)</li>
        <li>Cho A = (-∞; 3], B = (1; 10). A \ B là: A) (-∞; 1] B) [3; 10) C) (-∞; 1) D) (3; 10)</li>
        <li>M = [-4; 1], N = (-2; 3]. M ∪ N là: A) (-2; 1] B) [-4; -2] C) (1; 3] D) [-4; 3]</li>
        <li>E = R, A = [2; +∞). C_E A là: A) (-∞; 2) B) (-∞; 2] C) (2; +∞) D) R</li>
        <li>A là chẵn &lt; 10; E là N &lt; 10. C_E A là: A) {'{'}0; 2; 4; 6; 8{'}'} B) {'{'}1; 3; 5; 7; 9{'}'} C) {'{'}1; 3; 5; 7{'}'} D) {'{'}10{'}'}</li>
        <li>Tìm m để A = [1; 3], B = [m; m+1] giao khác rỗng: A) 0 ≤ m ≤ 2 B) 0 &lt; m &lt; 2 C) m &lt; 1 hoặc m &gt; 2 D) m ≤ 0 hoặc m ≥ 2</li>
        <li>Tìm m để A = (-∞; m+1) ⊂ B = [-4; +∞): A) m ≥ −5 B) m &gt; −5 C) m ≤ −5 D) m &lt; −5</li>
        <li>m để (m−1; 5) ∩ (3; +∞) có độ dài 1: A) m = 3 B) m = 4 C) m = 5 D) m = 2</li>
        <li>Lớp có 15 giỏi Toán, 10 giỏi Anh, 5 giỏi cả hai. Số giỏi ít nhất 1 môn: A) 25 B) 30 C) 15 D) 20</li>
        <li>100 người: 70 thích phim, 60 thích nhạc, ai cũng thích ít nhất 1. Số thích cả hai? A) 10 B) 20 C) 30 D) 40</li>
      </ol>
      <p className="text-white font-semibold">B. Đề thi — Đề số 2</p>
      <ol className="list-decimal ml-5 space-y-1">
        <li>A = (0; 6], B = [3; 9). A ∪ B: A) (0; 9) B) [3; 6] C) (0; 3) D) (6; 9)</li>
        <li>A = [-2; 5), B = (3; 7]. B \ A: A) [-2; 3] B) (5; 7) C) [5; 7] D) (3; 5)</li>
        <li>M = (-∞; 0), N = [-1; 4]. M ∩ N: A) [-1; 0) B) (-∞; 4] C) (-1; 0) D) ∅</li>
        <li>E = R, A = (-∞; 0). C_E A: A) (0; +∞) B) [0; +∞) C) R \ {'{'}0{'}'} D) (-∞; 0]</li>
        <li>E = {'{'}-3, -2, -1, 0, 1, 2, 3{'}'}, A = nghiệm nguyên của x² − 1 = 0. C_E A: A) {'{'}-1; 1{'}'} B) {'{'}-3; -2; 0; 2; 3{'}'} C) {'{'}-3; -2; 2; 3{'}'} D) {'{'}0{'}'}</li>
        <li>Tìm m để [m; m+2] và [0; 1] không chung điểm: A) m &lt; −1 hoặc m &gt; 1 B) m ≤ −2 hoặc m ≥ 1 C) −2 &lt; m &lt; 1 D) m &lt; −2 hoặc m &gt; 1</li>
        <li>Tìm m để [m; +∞) ⊂ (2; +∞): A) m ≥ 2 B) m &gt; 2 C) m &lt; 2 D) m ≤ 2</li>
        <li>m để [0; 3] ∩ [m; m+1] có độ dài 1: A) m = 0 hoặc 2 B) m = 0 C) m = 2 D) 0 ≤ m ≤ 2</li>
        <li>10A: 40 HS; 20 bóng đá, 15 cầu lông, 8 cả hai. Không chơi môn nào: A) 13 B) 5 C) 7 D) 12</li>
        <li>Khảo sát 100 người: 70 phim, 60 nhạc, ai cũng thích ≥1. Cả hai: A) 10 B) 20 C) 30 D) 40</li>
      </ol>
      <p className="text-white font-semibold">C. Đáp án</p>
      <p>Đề 1: 1B, 2A, 3D, 4A, 5B, 6A, 7A, 8C, 9D, 10A.
    <br/>Đề 2: 1A, 2C, 3A, 4B, 5B, 6D, 7B, 8A, 9A, 10C.</p>
    </div>
  )

  // Example 4 - rich formatted for "Bài tập cuối chương 1"
  const example4Rich: React.ReactNode = (
    <div className="text-sm text-neutral-200 leading-relaxed space-y-3">
      <h3 className="text-white text-base font-semibold">PHẦN 1: GIÁO ÁN HỌC TẬP</h3>
      <h4 className="text-white font-semibold">GIÁO ÁN: BÀI TẬP CUỐI CHƯƠNG 1</h4>
      <p>Môn học: <span className="font-semibold">Toán Học</span> - Lớp 10<br/>Chương 1: Mệnh đề và Tập hợp<br/>Thời lượng: 1 tiết (45 phút)</p>

      <h4 className="text-white font-semibold">I. MỤC TIÊU BÀI HỌC</h4>
      <div>
        <p className="text-white font-semibold">Kiến thức:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Hệ thống hóa kiến thức: mệnh đề, phủ định, lượng từ; tập hợp, tập con; các phép toán ∪, ∩, \\, phần bù.</li>
          <li>Nhận biết và phân loại dạng bài thường gặp.</li>
        </ul>
      </div>
      <div>
        <p className="text-white font-semibold">Kỹ năng:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Giải bài tập tổng hợp mức độ trung bình; vận dụng linh hoạt kiến thức chương.</li>
          <li>Biểu diễn tập hợp trên trục số khi làm phép toán trên R.</li>
          <li>Đọc hiểu, phân tích đề và trình bày lời giải mạch lạc.</li>
        </ul>
      </div>
      <div>
        <p className="text-white font-semibold">Thái độ:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Tự giác, chủ động ôn tập; cẩn thận, chính xác; tự tin trước kiểm tra.</li>
        </ul>
      </div>
      <div>
        <p className="text-white font-semibold">Năng lực hình thành:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Tư duy và lập luận; giải quyết vấn đề; tự học và tự quản lý.</li>
        </ul>
      </div>

      <h4 className="text-white font-semibold">II. CHUẨN BỊ</h4>
      <ul className="list-disc ml-5 space-y-1">
        <li><span className="font-semibold">Giáo viên:</span> Hệ thống câu hỏi lý thuyết, phiếu bài tập tổng hợp.</li>
        <li><span className="font-semibold">Học sinh:</span> Ôn toàn bộ chương, làm bài tập cuối chương trong SGK.</li>
      </ul>

      <h4 className="text-white font-semibold">III. TIẾN TRÌNH DẠY HỌC</h4>
      <ul className="space-y-2">
        <li>
          <p className="text-white font-semibold">Hoạt động 1 — 5 phút: Ổn định và kiểm tra chuẩn bị</p>
          <p>Hỏi nhanh: “Phủ định của mệnh đề có ∀ là gì?”; “Định nghĩa A \\ B?”.</p>
        </li>
        <li>
          <p className="text-white font-semibold">Hoạt động 2 — 10 phút: Hệ thống hóa kiến thức</p>
          <p>Dùng sơ đồ tư duy tổng kết: Mệnh đề; Tập hợp; Liên kết ứng dụng trên R.</p>
        </li>
        <li>
          <p className="text-white font-semibold">Hoạt động 3 — 25 phút: Luyện tập và chữa bài</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Dạng 1: Mệnh đề — xét đúng/sai, phủ định (có lượng từ).</li>
            <li>Dạng 2: Phép toán trên khoảng/đoạn/nửa khoảng.</li>
            <li>Dạng 3: Tập con và đếm số tập con.</li>
            <li>Dạng 4: Bài toán thực tế đếm số phần tử (biểu đồ Ven / công thức).</li>
          </ul>
        </li>
        <li>
          <p className="text-white font-semibold">Hoạt động 4 — 5 phút: Củng cố và dặn dò</p>
          <p>Nhắc lỗi sai thường gặp, hoàn thiện bài còn lại, chuẩn bị kiểm tra 45 phút.</p>
        </li>
      </ul>

      <h3 className="text-white text-base font-semibold">PHẦN 2: TÀI LIỆU HỖ TRỢ</h3>
      <p className="text-white font-semibold">A. Sơ đồ tư duy tổng kết chương 1</p>
      <ul className="list-decimal ml-5 space-y-1">
        <li>Mệnh đề: định nghĩa; phủ định P̄; lượng từ ∀, ∃ (phủ định ∀ ↔ ∃); mệnh đề chứa biến P(x).</li>
        <li>Tập hợp: định nghĩa; cách xác định; tập con; phép toán ∩, ∪, \\, C_E A.</li>
        <li>Ứng dụng trên R: dùng trục số; công thức n(A ∪ B) = n(A) + n(B) − n(A ∩ B).</li>
      </ul>
      <p className="text-white font-semibold">B. Lỗi sai thường gặp</p>
      <ul className="ml-5 space-y-1 list-disc">
        <li>Nhầm ∈ và ⊂; phủ định sai lượng từ; sai đầu mút trong phép toán khoảng/đoạn; quên ∅ và chính tập hợp khi liệt kê tập con.</li>
      </ul>
      <p className="text-white font-semibold">C. Bài tập tổng hợp tự luyện</p>
      <ul className="list-decimal ml-5 space-y-1">
        <li>Lập phủ định và xét đúng/sai: P: “∀n ∈ N, n² + 1 không chia hết cho 3”.</li>
        <li>A = {'{'}x ∈ N | x là ước của 18{'}'}, B = {'{'}x ∈ N | x là ước của 24{'}'}: tìm A ∩ B, A ∪ B.</li>
        <li>A = [-5; 4), B = (-1; 6]: tìm A ∪ B, A \\ B.</li>
        <li>E = {'{'}x, y, z, t{'}'}: có bao nhiêu tập con chứa đúng 2 phần tử?</li>
        <li>Khảo sát 60 người: 35 đọc TT, 28 đọc TN, 8 đọc cả hai — số không đọc?</li>
      </ul>
      <p><span className="font-semibold">Đáp án tóm tắt:</span> P̄: “∃n ∈ N, n² + 1 chia hết cho 3”; A ∩ B = {'{'}1, 2, 3, 6{'}'}, A ∪ B = {'{'}1, 2, 3, 4, 6, 8, 9, 12, 18, 24{'}'}; A ∪ B = [-5; 6], A \\ B = [-5; -1]; có 6 tập con 2 phần tử; 5 người không đọc báo nào.</p>

      <h3 className="text-white text-base font-semibold">PHẦN 3: ĐỀ THI (45 phút)</h3>
      <p className="text-white font-semibold">A. Ma trận</p>
      <ul className="list-disc ml-5 space-y-1">
        <li>Chủ đề 1: Mệnh đề/ lượng từ — Nhận biết 1, Thông hiểu 1 (2 câu)</li>
        <li>Chủ đề 2: Tập hợp, tập con — Nhận biết 1, Thông hiểu 1 (2 câu)</li>
        <li>Chủ đề 3: Phép toán trên tập hữu hạn — Thông hiểu 2 (2 câu)</li>
        <li>Chủ đề 4: Phép toán trên R — Thông hiểu 2, Vận dụng thấp 1 (3 câu)</li>
        <li>Chủ đề 5: Đếm số phần tử — Vận dụng thấp 1 (1 câu)</li>
      </ul>
      <p className="text-white font-semibold">B. Đề thi — Đề số 1, 2, 3, 4</p>
      <div className="space-y-2">
        <p className="font-semibold">Đề số 1</p>
        <ol className="list-decimal ml-5 space-y-1">
          <li>Phủ định của “∃x ∈ R, x² − x + 2 = 0” là: A) “∃x ∈ R, x² − x + 2 ≠ 0” B) “∀x ∈ R, x² − x + 2 = 0” C) “∀x ∈ R, x² − x + 2 ≠ 0” D) “∀x ∈ R, x² − x + 2 &gt; 0”.</li>
          <li>Mệnh đề đúng: A) ∀n ∈ N, n² ≥ n B) ∃x ∈ R, x² &lt; 0 C) ∀x ∈ R, |x| &gt; 0 D) ∃x ∈ Q, x² = 2.</li>
          <li>Số tập con của {'{'}a, b, c{'}'}: A) 3 B) 6 C) 8 D) 9.</li>
          <li>X = {'{'}x ∈ N | bội của 3 và 4{'}'}: A) 12 ∈ X B) 6 ∈ X C) 8 ∈ X D) 20 ∈ X.</li>
          <li>A = {'{'}1, 2, 4, 6{'}'}, B = {'{'}1, 3, 4, 5, 6{'}'}: A \\ B là: A) {'{'}1, 4, 6{'}'} B) {'{'}2{'}'} C) {'{'}3, 5{'}'} D) {'{'}2, 3, 5{'}'}.</li>
          <li>X: giỏi Văn, Y: giỏi Toán. X ∩ Y biểu diễn: A) Ít nhất 1 môn B) Cả hai môn C) Chỉ Văn D) Chỉ Toán.</li>
          <li>A = [-2; 7), B = (1; 9]: A ∪ B là: A) [-2; 9] B) (1; 7) C) [-2; 1] D) (7; 9].</li>
          <li>A = (-∞; 5], B = [0; +∞): A ∩ B: A) (0; 5) B) [0; 5] C) R D) ∅.</li>
          <li>E = (-4; 4]; phần bù của [-1; 4] trong E: A) (-4; -1) B) [-4; -1) C) (-4; -1] D) [-4; -1].</li>
          <li>Lớp có 25 đá bóng, 23 bóng chuyền, 13 cả hai: số học sinh ít nhất 1 môn: A) 48 B) 61 C) 35 D) 12.</li>
        </ol>
        <p className="font-semibold">Đề số 2</p>
        <ol className="list-decimal ml-5 space-y-1">
          <li>Phủ định “∀x ∈ R, x² + 1 &gt; 0”: A) ∀x ∈ R, x² + 1 ≤ 0 B) ∃x ∈ R, x² + 1 ≤ 0 C) ∃x ∈ R, x² + 1 &gt; 0 D) ∃x ∈ R, x² + 1 &lt; 0.</li>
          <li>Mệnh đề sai: A) ∃n ∈ N, n² = n B) ∀x ∈ R, x² ≥ 0 C) ∃x ∈ Z, 2x = 3 D) ∀n ∈ N, n ≤ 2n.</li>
          <li>Số tập con có đúng 2 phần tử của {'{'}1, 2, 3, 4{'}'}: A) 4 B) 6 C) 8 D) 16.</li>
          <li>Y = {'{'}x ∈ Z | x² ≤ 4{'}'}: mệnh đề đúng: A) 3 ∈ Y B) {'{'}-2, -1, 0, 1, 2{'}'} ⊂ Y C) Y = {'{'}0, 1, 2{'}'} D) −2 ∈ Y.</li>
          <li>M = {'{'}a, b, d{'}'}, N = {'{'}b, c, e, d{'}'}: M ∪ N là: A) {'{'}b, d{'}'} B) {'{'}a, c, e{'}'} C) {'{'}a, b, c, d, e{'}'} D) {'{'}a{'}'}.</li>
          <li>A: tam giác đều; B: tam giác cân. A ∩ B là: A) hình bình hành B) hình thang cân C) hình vuông D) hình thoi.</li>
          <li>A = (-3; 5], B = [2; 8): A ∩ B: A) (-3; 2) B) (-3; 8) C) [2; 5] D) (5; 8).</li>
          <li>A = (-∞; 1], B = (-2; +∞): A \\ B: A) (-∞; -2] B) (-∞; -2) C) (1; +∞) D) ∅.</li>
          <li>E = R; phần bù của (-∞; 3] là: A) (3; +∞) B) [3; +∞) C) (-∞; 3) D) R.</li>
          <li>40 HS; 30 tốt Toán, 25 tốt Lý, 20 tốt cả hai: không tốt môn nào: A) 10 B) 5 C) 15 D) 20.</li>
        </ol>
        <p className="font-semibold">Đề số 3</p>
        <ol className="list-decimal ml-5 space-y-1">
          <li>Phủ định “∃n ∈ N, n² = 5”: A) “∃n ∈ N, n² ≠ 5” B) “∀n ∈ N, n² = 5” C) “∀n ∈ N, n² ≠ 5” D) “∀n ∉ N, n² = 5”.</li>
          <li>Mệnh đề đúng: A) ∀x ∈ R, −x² &lt; 0 B) ∃n ∈ N, n² + 1 chia hết cho 4 C) ∀x ∈ Z, |x| ≥ 0 D) ∃x ∈ R, x &lt; 1/x.</li>
          <li>Tập X = {'{'}1, {'{'}2, 3{'}'}, 4{'}'}: khẳng định đúng: A) {'{'}2, 3{'}'} ⊂ X B) {'{'}2, 3{'}'} ∈ X C) 3 ∈ X D) X có 3 phần tử.</li>
          <li>A là số tự nhiên lẻ: khẳng định đúng: A) 2 ∈ A B) 10 ∉ A C) A = {'{'}1, 3, 5, 7{'}'} D) 4 ∈ A.</li>
          <li>B \\ A với A = {'{'}1, 5{'}'}, B = {'{'}1, 3, 5{'}'}: A) {'{'}1, 5{'}'} B) {'{'}1, 3{'}'} C) {'{'}3{'}'} D) {'{'}1{'}'}.</li>
          <li>Ký hiệu X = [a; b] biểu diễn: A) {'{'}x ∈ R | a ≤ x ≤ b{'}'} B) {'{'}x ∈ R | a &lt; x &lt; b{'}'} C) {'{'}x ∈ R | a ≤ x &lt; b{'}'} D) {'{'}x ∈ R | a &lt; x ≤ b{'}'}.</li>
          <li>A = (-10; 2], B = [-5; 4): A ∪ B: A) [-5; 2] B) (-10; 4) C) (-10; -5) D) (2; 4).</li>
          <li>A = (-∞; 0], B = [0; +∞): A ∩ B: A) R B) ∅ C) {'{'}0{'}'} D) R \ {'{'}0{'}'}.</li>
          <li>E = {'{'}x ∈ Z | −3 ≤ x ≤ 3{'}'}, A = {'{'}-2, 0, 2{'}'}: C_E A: A) {'{'}-3, -1, 1, 3{'}'} B) {'{'}-3, 3{'}'} C) {'{'}-1, 1{'}'} D) ∅.</li>
          <li>Lớp 10B: 28 CLB Anh, 15 CLB Tin, 10 cả hai, ai cũng tham gia ≥1 — sĩ số lớp: A) 43 B) 53 C) 30 D) 33.</li>
        </ol>
        <p className="font-semibold">Đề số 4</p>
        <ol className="list-decimal ml-5 space-y-1">
          <li>Phủ định “∀x ∈ Q, x ≠ 0”: A) “∀x ∈ Q, x = 0” B) “∃x ∈ Q, x ≠ 0” C) “∃x ∈ Q, x = 0” D) “∃x ∉ Q, x ≠ 0”.</li>
          <li>Mệnh đề sai: A) ∃x ∈ R, x &gt; x² B) ∀n ∈ N, n² + 1 không chia hết cho 3 C) ∀x ∈ R, (x−1)² ≥ 0 D) ∃n ∈ N, n + 3 = 0.</li>
          <li>C = {'{'}∅, 1, {'{'}2{'}'}{'}'}: khẳng định sai: A) ∅ ∈ C B) {'{'}2{'}'} ∈ C C) 1 ⊂ C D) 1 ∈ C.</li>
          <li>Y = {'{'}x ∈ R | (x−1)(x+2) = 0{'}'}: dạng liệt kê: A) {'{'}1{'}'} B) {'{'}-2{'}'} C) {'{'}1, -2{'}'} D) {'{'}1, 2{'}'}.</li>
          <li>A: hình thoi, B: hình chữ nhật. A ∩ B là: A) hình bình hành B) hình thang cân C) hình vuông D) hình thoi.</li>
          <li>X = {'{'}a, b{'}'}, Y = {'{'}a, b, c{'}'}: đúng: A) X = Y B) Y ⊂ X C) X ⊂ Y D) X ∩ Y = Y.</li>
          <li>A = [3; 10], B = (5; 12): A \\ B: A) [3; 5] B) (10; 12) C) [3; 5) D) (5; 10].</li>
          <li>A = (-∞; +∞), B = [-2; 2]: A ∪ B: A) R B) B C) ∅ D) R \ B.</li>
          <li>E = N, A chẵn: C_E A: A) lẻ B) ∅ C) nguyên tố D) N.</li>
          <li>Đội văn nghệ: 10 hát, 9 múa, 6 cả hai. Số người biết ≥1: A) 19 B) 15 C) 13 D) 25.</li>
        </ol>
      </div>
      <p className="text-white font-semibold">C. Đáp án</p>
      <div className="space-y-1">
        <p>Đề 1: 1C, 2A, 3C, 4A, 5B, 6B, 7A, 8B, 9A, 10C.</p>
        <p>Đề 2: 1B, 2C, 3B, 4D, 5C, 6A, 7C, 8A, 9A, 10B.</p>
        <p>Đề 3: 1C, 2C, 3B, 4B, 5C, 6A, 7B, 8C, 9A, 10D.</p>
        <p>Đề 4: 1C, 2D, 3C, 4C, 5C, 6C, 7A, 8A, 9A, 10C.</p>
      </div>
    </div>
  )


  return (
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
          <div className="relative z-10 rounded-[14px] border border-[#2f2f4a] bg-[#1a1a2d] p-5 md:p-6">
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
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="mt-4 flex items-center gap-3">
          <div className="text-sm text-neutral-300">Gemini version</div>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="text-sm bg-[#23233a] border border-[#2a2a44] rounded-md px-3 py-2 focus:outline-none"
          >
            <option>2.5 Pro</option>
            <option>2.0 Flash</option>
            <option>1.5 Pro</option>
          </select>
        </div>

        {/* Example prompts */}
        <h2 className="mt-8 mb-3 text-lg font-semibold text-white">Example prompts</h2>
        <div className="space-y-6">
          {/* Example 1 */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative rounded-2xl p-[2px] overflow-hidden h-64 md:h-72 lg:h-80">
              <div className="absolute inset-0 bg-[conic-gradient(at_50%_50%,#6b6bff_0%,#9b59b6_20%,#00c3ff_60%,#6b6bff_100%)] opacity-40"></div>
              <div className="relative z-10 rounded-[14px] border border-[#2f2f4a] bg-[#1a1a2d] h-full p-4 text-sm text-neutral-300 overflow-y-auto pr-2">
                <ExampleBlock data={example1Data} />
              </div>
            </div>
            <div className="relative rounded-2xl p-[2px] overflow-hidden h-64 md:h-72 lg:h-80">
              <div className="absolute inset-0 bg-[conic-gradient(at_50%_50%,#6b6bff_0%,#9b59b6_20%,#00c3ff_60%,#6b6bff_100%)] opacity-40"></div>
              <div className="relative z-10 rounded-[14px] border border-[#2f2f4a] bg-[#1a1a2d] h-full p-4 overflow-y-auto pr-2">{example1Rich}</div>
            </div>
          </div>

          {/* Example 2 */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative rounded-2xl p-[2px] overflow-hidden h-64 md:h-72 lg:h-80">
              <div className="absolute inset-0 bg-[conic-gradient(at_50%_50%,#6b6bff_0%,#9b59b6_20%,#00c3ff_60%,#6b6bff_100%)] opacity-40"></div>
              <div className="relative z-10 rounded-[14px] border border-[#2f2f4a] bg-[#1a1a2d] h-full p-4 text-sm text-neutral-300 overflow-y-auto pr-2">
                <ExampleBlock data={example2Data} />
              </div>
            </div>
            <div className="relative rounded-2xl p-[2px] overflow-hidden h-64 md:h-72 lg:h-80">
              <div className="absolute inset-0 bg-[conic-gradient(at_50%_50%,#6b6bff_0%,#9b59b6_20%,#00c3ff_60%,#6b6bff_100%)] opacity-40"></div>
              <div className="relative z-10 rounded-[14px] border border-[#2f2f4a] bg-[#1a1a2d] h-full p-4 overflow-y-auto pr-2">
                {example2Rich}
              </div>
            </div>
          </div>
          {/* Example 3 */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative rounded-2xl p-[2px] overflow-hidden h-64 md:h-72 lg:h-80">
              <div className="absolute inset-0 bg-[conic-gradient(at_50%_50%,#6b6bff_0%,#9b59b6_20%,#00c3ff_60%,#6b6bff_100%)] opacity-40"></div>
              <div className="relative z-10 rounded-[14px] border border-[#2f2f4a] bg-[#1a1a2d] h-full p-4 text-sm text-neutral-300 overflow-y-auto pr-2">
                <ExampleBlock data={example3Data} />
              </div>
            </div>
            <div className="relative rounded-2xl p-[2px] overflow-hidden h-64 md:h-72 lg:h-80">
              <div className="absolute inset-0 bg-[conic-gradient(at_50%_50%,#6b6bff_0%,#9b59b6_20%,#00c3ff_60%,#6b6bff_100%)] opacity-40"></div>
              <div className="relative z-10 rounded-[14px] border border-[#2f2f4a] bg-[#1a1a2d] h-full p-4 overflow-y-auto pr-2">{example3Rich}</div>
            </div>
          </div>
          {/* Example 4 */} 
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative rounded-2xl p-[2px] overflow-hidden h-64 md:h-72 lg:h-80">
              <div className="absolute inset-0 bg-[conic-gradient(at_50%_50%,#6b6bff_0%,#9b59b6_20%,#00c3ff_60%,#6b6bff_100%)] opacity-40"></div>
              <div className="relative z-10 rounded-[14px] border border-[#2f2f4a] bg-[#1a1a2d] h-full p-4 text-sm text-neutral-300 overflow-y-auto pr-2">
                <ExampleBlock data={example4Data} />
              </div>
            </div>
            <div className="relative rounded-2xl p-[2px] overflow-hidden h-64 md:h-72 lg:h-80">
              <div className="absolute inset-0 bg-[conic-gradient(at_50%_50%,#6b6bff_0%,#9b59b6_20%,#00c3ff_60%,#6b6bff_100%)] opacity-40"></div>
              <div className="relative z-10 rounded-[14px] border border-[#2f2f4a] bg-[#1a1a2d] h-full p-4 overflow-y-auto pr-2">{example4Rich}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PromptTemplate10Chuong2



