import React from 'react'
import { useNavigate } from 'react-router-dom'


const PromptFeatures: React.FC = () => {
  const navigate = useNavigate()


  const features = [
    {
      id: 1,
      title: "Mua Prompt",
      description: "Tìm kiếm và thuê các chuyên gia AI tạo prompt chuyên nghiệp",
      image: new URL('../../assets/Image/ThuePrompt_1.png', import.meta.url).href,
      gradient: "from-blue-500 to-purple-600",
      glowColor: "blue-500",
      features: ["Chuyên gia AI hàng đầu", "Prompt tùy chỉnh", "Hỗ trợ 24/7", "Bảo đảm chất lượng"]
    },
    {
      id: 2,
      title: "Gói Prompt",
      description: "Danh sách các gói Prompt được tối ưu sẵn cho giáo dục",
      image: new URL('../../assets/Image/TaoPrompt.png', import.meta.url).href,
      gradient: "from-green-500 to-emerald-600",
      glowColor: "green-500",
      features: ["Templates có sẵn", "AI hỗ trợ tạo", "Tối ưu hóa tự động", "Xuất nhiều định dạng"]
    },
    {
      id: 3,
      title: "Bán Prompt",
      description: "Bán và chia sẻ prompt của bạn với cộng đồng giáo viên",
      image: new URL('../../assets/Image/BanPrompt.png', import.meta.url).href,
      gradient: "from-orange-500 to-red-600",
      glowColor: "orange-500",
      features: ["Hệ thống thanh toán", "Quản lý đơn hàng", "Thống kê doanh thu", "Cộng đồng người mua"]
    }
  ]

  return (
    <div className="py-8 px-4 bg-[#1a1a2d]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Khám phá các tính năng
          </h2>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
            Nền tảng toàn diện cho việc mua, bán và tạo prompt AI dành cho giáo dục
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <button
              key={feature.id}
              className="group relative bg-[#23233a] rounded-2xl border border-[#2a2a44] hover:border-[#3a3a54] transition-all duration-300 hover:scale-105 hover:shadow-2xl h-96 overflow-hidden w-full text-left"
              style={{
                animationDelay: `${index * 0.1}s`
              }}
              onClick={() => {
                switch (feature.id) {
                  case 1:
                    navigate('/Hire')
                    break
                  case 2:
                    navigate('/packages')
                    break
                  case 3:
                    navigate('/Sell')
                    break
                  default:
                    break
                }
              }}
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
              
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-2xl blur-sm"
                style={{ backgroundImage: `url(${feature.image})` }}
              >
                <div className="absolute inset-0 bg-black/40 rounded-2xl"></div>
              </div>
              
              {/* Content Overlay */}
              <div className="relative z-10 h-full flex flex-col justify-end p-8">
                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                  {feature.title}
                </h3>
                
                {/* Description */}
                <p className="text-neutral-200 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Features List */}
                <ul className="space-y-2">
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-sm text-neutral-200">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.gradient} mr-3 flex-shrink-0`}></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Hover Glow Border */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm`}></div>
            </button>
          ))}
        </div>

        
      </div>
    </div>
  )
}

export default PromptFeatures
