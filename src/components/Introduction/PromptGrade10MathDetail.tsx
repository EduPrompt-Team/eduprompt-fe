import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Heart, Download, Eye, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const PromptGrade10MathDetail: React.FC = () => {
  const navigate = useNavigate()
  const [isFavorite, setIsFavorite] = useState(false)
  const handleLibrary = () => {
    navigate('/mystorage')
  }
  const handleToggleFavorite = () => {
    setIsFavorite((prev) => !prev)
  }
  // Sample data for the math prompts
  const mathPrompts = [
    {
      id: 1,
      title: "Mệnh Đề",
      description: "Hướng dẫn chi tiết cách giải phương trình bậc hai với các bước rõ ràng và ví dụ minh họa",
      image: new URL('../../assets/Image/Toan10.png', import.meta.url).href,
      downloads: 45,
      favorites: 12,
      views: 156,
      tags: ["Phương trình", "Bậc hai", "Đại số"],
      difficulty: "Cơ bản",
      grade: "10"
    },
    {
      id: 2,
      title: "Tập Hợp",
      description: "Các công thức và phương pháp giải bài tập hình học không gian lớp 10",
      image: new URL('../../assets/Image/Toan10.png', import.meta.url).href,
      downloads: 38,
      favorites: 8,
      views: 134,
      tags: ["Hình học", "Không gian", "Công thức"],
      difficulty: "Trung bình",
      grade: "10"
    },
    {
      id: 3,
      title: "Các Phép Toán Trên Tập Hợp",
      description: "Tìm hiểu về các loại hàm số và cách vẽ đồ thị chính xác",
      image: new URL('../../assets/Image/Toan10.png', import.meta.url).href,
      downloads: 52,
      favorites: 15,
      views: 189,
      tags: ["Hàm số", "Đồ thị", "Phân tích"],
      difficulty: "Cơ bản",
      grade: "10"
    },
    {
      id: 4,
      title: "Bài Tập Cuối Chương 1",
      description: "Các phương pháp chứng minh bất đẳng thức và ứng dụng thực tế",
      image: new URL('../../assets/Image/Toan10.png', import.meta.url).href,
      downloads: 29,
      favorites: 6,
      views: 98,
      tags: ["Bất đẳng thức", "Chứng minh", "Logic"],
      difficulty: "Nâng cao",
      grade: "10"
    }
  ]

  const selectedPrompt = mathPrompts[0] // First prompt as selected

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="bg-[#1a1a2d] border-b border-[#2f2f4a] py-4">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-white">Toán Học Lớp 10</h1>
          <p className="text-neutral-400 mt-1">Các prompt AI cho môn Toán lớp 10</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Side - Image Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Học Kỳ 1 - Chương 1</h2>
            <div className="grid grid-cols-2 gap-4">
              {mathPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="group relative bg-[#23233a] rounded-xl border border-[#2a2a44] hover:border-[#3a3a54] transition-all duration-300 hover:scale-105 overflow-hidden cursor-pointer"
                >
                  <div className="aspect-square relative rounded-xl overflow-hidden">
                    {/* Blurred background image */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm"
                      style={{ backgroundImage: `url(${prompt.image})` }}
                    ></div>
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 rounded-xl group-hover:bg-black/30 transition-all duration-300"></div>
                    
                    {/* Text content - not blurred */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-4">
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                          {prompt.title}
                        </h3>
                        <p className="text-xs text-neutral-300 mb-2 line-clamp-3 leading-relaxed">
                          {prompt.description}
                        </p>
                        <div className="flex items-center justify-center space-x-2 text-xs text-neutral-300">
                          <span className="flex items-center">
                            <Download className="w-3 h-3 mr-1" />
                            {prompt.downloads}
                          </span>
                          <span className="flex items-center">
                            <Heart className="w-3 h-3 mr-1" />
                            {prompt.favorites}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Content Details */}
          <div className="space-y-6">
            {/* Header with heart icon */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-neutral-400">▲ EduPrompt</span>
                <Heart className="w-4 h-4 text-red-500" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">
                Mệnh Đề và Tập Hợp
              </h1>
            </div>

            {/* Statistics */}
            <div className="flex items-center space-x-6 text-sm text-neutral-300">
              <div className="flex items-center space-x-1">
                <Download className="w-4 h-4" />
                <span>{selectedPrompt.downloads} Downloads</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>{selectedPrompt.favorites} Favorites</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{selectedPrompt.views} Views</span>
              </div>
            </div>

            {/* Creator */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-neutral-400">@eduprompt</span>
              <Heart className="w-3 h-3 text-red-500" />
              <span className="text-sm text-neutral-400">1</span>
            </div>

            {/* Tags/Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-[#2a2a44] rounded text-xs text-neutral-300">
                {selectedPrompt.tags.length} từ khóa
              </span>
              <span className="px-2 py-1 bg-[#2a2a44] rounded text-xs text-neutral-300">
                2.5-FLASH-IMAGE
              </span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs flex items-center">
                <Check className="w-3 h-3 mr-1" />
                Tested
              </span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs flex items-center">
                <Check className="w-3 h-3 mr-1" />
                Instructions
              </span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs flex items-center">
                <Check className="w-3 h-3 mr-1" />
                9 examples
              </span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs flex items-center">
                <Check className="w-3 h-3 mr-1" />
                HD images
              </span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs flex items-center">
                <Check className="w-3 h-3 mr-1" />
                No artists
              </span>
            </div>


            {/* Pricing */}
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-400">500.000 VNĐ</div>
              <button className="text-blue-400 hover:text-blue-300 text-sm">
                Tôi nhận được gì khi tải xuống prompt?
              </button>
            </div>

            {/* Action Button */}
            <Button 
              onClick={handleLibrary} 
              className="w-full text-white font-semibold py-3 rounded-lg 
              bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 
              shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 
              transition-all duration-300 ease-out transform hover:-translate-y-0.5 active:translate-y-0 
              focus:outline-none focus:ring-2 focus:ring-sky-400/60">
              Thêm vào Thư viện
            </Button>
            <Button 
              onClick={handleToggleFavorite} 
              aria-pressed={isFavorite} 
              className={`w-full ${isFavorite ? 'bg-pink-600 hover:bg-pink-700' : 'bg-[#2a2a44] hover:bg-[#3a3a54]'} text-white font-semibold py-3 rounded-lg mt-2 flex items-center justify-center`}
            >
              <Heart className="w-4 h-4 mr-2 text-white" fill={isFavorite ? 'currentColor' : 'none'} />
              Thêm vào yêu thích
            </Button>

            {/* Terms */}
            <p className="text-xs text-neutral-500 leading-relaxed">
              Sau khi tải xuống, bạn sẽ có quyền truy cập vào file prompt mà bạn có thể sử dụng với EduPrompt hoặc trên PromptBase. 
              Bằng cách tải xuống prompt này, bạn đồng ý với các điều khoản dịch vụ của chúng tôi.
            </p>

            {/* Timestamp */}
            <p className="text-xs text-neutral-500">
              Đã thêm 4 giờ trước
            </p>

            {/* Related App */}
            <div className="bg-[#23233a] rounded-lg p-4 border border-[#2a2a44]">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-12 h-12 bg-cover bg-center rounded"
                  style={{ backgroundImage: `url(${selectedPrompt.image})` }}
                ></div>
                <div>
                  <h3 className="font-semibold text-sm">{selectedPrompt.title} Generator</h3>
                  <p className="text-xs text-neutral-400">Ứng dụng liên quan</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Reviews Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">8 đánh giá từ người tạo</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-lg font-semibold text-white">5.0</span>
                  </div>
                </div>
              </div>

              {/* Review Tabs */}
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-[#2a2a44] text-white rounded-lg text-sm font-medium">
                  Đánh giá cho prompt này (1)
                </button>
                <button className="px-4 py-2 bg-[#1a1a2d] text-neutral-400 rounded-lg text-sm font-medium hover:text-white transition-colors">
                  Đánh giá cho người tạo (8)
                </button>
              </div>
            </div>

            {/* Review Cards */}
            <div className="space-y-4">
              {/* Review Card 1 */}
              <div className="bg-[#23233a] rounded-lg p-6 border border-[#2a2a44]">
                <div className="space-y-4">
                  {/* Rating */}
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-neutral-300 leading-relaxed">
                    Thực sự hữu ích, tôi đã thử với nhiều kết hợp khác nhau và nó luôn cho kết quả tốt. Cảm ơn!
                  </p>

                  {/* Review Image */}
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-8 h-8 bg-cover bg-center rounded"
                      style={{ backgroundImage: `url(${new URL('../../assets/Image/FuckBoy.jpg', import.meta.url).href})` }}
                    ></div>
                    <span className="text-sm text-neutral-400">Nguyễn Bắc Hùng</span>
                  </div>

                  {/* Review Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">H</span>
                      </div>
                      <span className="text-sm text-neutral-400">BacHung</span>
                      <span className="text-sm text-neutral-500">- 29 Tháng 9, 2025</span>
                    </div>
                    <div className="flex items-center space-x-1 text-green-400">
                      <Check className="w-3 h-3" />
                      <span className="text-xs">Mua đã xác minh</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Card 2 */}
              <div className="bg-[#23233a] rounded-lg p-6 border border-[#2a2a44]">
                <div className="space-y-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-neutral-300 leading-relaxed">
                    Prompt này rất chi tiết và dễ hiểu. Con tôi học toán tốt hơn nhiều sau khi sử dụng.
                  </p>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-8 h-8 bg-cover bg-center rounded"
                      style={{ backgroundImage: `url(${new URL('../../assets/Image/LeeChongHiu.png', import.meta.url).href})` }}
                    ></div>
                    <span className="text-sm text-neutral-400">Lee Chong Hiu</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">A</span>
                      </div>
                      <span className="text-sm text-neutral-400">@lee_chong_hiu</span>
                      <span className="text-sm text-neutral-500">- 25 Tháng 9, 2025</span>
                    </div>
                    <div className="flex items-center space-x-1 text-green-400">
                      <Check className="w-3 h-3" />
                      <span className="text-xs">Mua đã xác minh</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Card 3 */}
              <div className="bg-[#23233a] rounded-lg p-6 border border-[#2a2a44]">
                <div className="space-y-4">
                  <div className="flex items-center">
                    {[...Array(4)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <p className="text-neutral-300 leading-relaxed">
                    Tốt nhưng cần thêm ví dụ thực tế hơn. Phần lý thuyết khá ổn.
                  </p>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-8 h-8 bg-cover bg-center rounded"
                      style={{ backgroundImage: `url(${new URL('../../assets/Image/DepTrai.png', import.meta.url).href})` }}
                    ></div>
                    <span className="text-sm text-neutral-400">Nguyễn Hoàng Trường Duy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">H</span>
                      </div>
                      <span className="text-sm text-neutral-400">@Truong_Duy</span>
                      <span className="text-sm text-neutral-500">- 22 Tháng 9, 2025</span>
                    </div>
                    <div className="flex items-center space-x-1 text-green-400">
                      <Check className="w-3 h-3" />
                      <span className="text-xs">Mua đã xác minh</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Card 4 */}
              <div className="bg-[#23233a] rounded-lg p-6 border border-[#2a2a44]">
                <div className="space-y-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-neutral-300 leading-relaxed">
                    Xuất sắc! Cách giải thích rất rõ ràng và logic. Học sinh dễ hiểu và áp dụng.
                  </p>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-8 h-8 bg-cover bg-center rounded"
                      style={{ backgroundImage: `url(${new URL('../../assets/Image/BoLao.jpg', import.meta.url).href})` }}
                    ></div>
                    <span className="text-sm text-neutral-400">Minh Lee</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">Đ</span>
                      </div>
                      <span className="text-sm text-neutral-400">@minh_lee</span>
                      <span className="text-sm text-neutral-500">- 20 Tháng 9, 2025</span>
                    </div>
                    <div className="flex items-center space-x-1 text-green-400">
                      <Check className="w-3 h-3" />
                      <span className="text-xs">Mua đã xác minh</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Card 5 */}
              <div className="bg-[#23233a] rounded-lg p-6 border border-[#2a2a44]">
                <div className="space-y-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-neutral-300 leading-relaxed">
                    Rất hài lòng với chất lượng. Con tôi đã cải thiện điểm số đáng kể.
                  </p>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-8 h-8 bg-cover bg-center rounded"
                      style={{ backgroundImage: `url(${new URL('../../assets/Image/My Princess.png', import.meta.url).href})` }}
                    ></div>
                    <span className="text-sm text-neutral-400">Trần Thị Hồng Trâm</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">M</span>
                      </div>
                      <span className="text-sm text-neutral-400">@nuuuu</span>
                      <span className="text-sm text-neutral-500">- 18 Tháng 9, 2025</span>
                    </div>
                    <div className="flex items-center space-x-1 text-green-400">
                      <Check className="w-3 h-3" />
                      <span className="text-xs">Mua đã xác minh</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Card 6 */}
              <div className="bg-[#23233a] rounded-lg p-6 border border-[#2a2a44]">
                <div className="space-y-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-neutral-300 leading-relaxed">
                    Prompt rất chi tiết và dễ hiểu. Tôi đã recommend cho nhiều bạn bè.
                  </p>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-8 h-8 bg-cover bg-center rounded"
                      style={{ backgroundImage: `url(${new URL('../../assets/Image/MatLol.jpg', import.meta.url).href})` }}
                    ></div>
                    <span className="text-sm text-neutral-400">Viên Minh</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">N</span>
                      </div>
                      <span className="text-sm text-neutral-400">@zien_minh</span>
                      <span className="text-sm text-neutral-500">- 15 Tháng 9, 2025</span>
                    </div>
                    <div className="flex items-center space-x-1 text-green-400">
                      <Check className="w-3 h-3" />
                      <span className="text-xs">Mua đã xác minh</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* View All Reviews Button */}
            <div className="text-center">
              <button className="px-6 py-2 bg-[#2a2a44] text-white rounded-lg text-sm font-medium hover:bg-[#3a3a54] transition-colors">
                Xem tất cả đánh giá
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PromptGrade10MathDetail