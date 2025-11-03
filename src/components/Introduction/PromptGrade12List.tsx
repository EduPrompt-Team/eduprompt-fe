import React from 'react'
import { useNavigate } from 'react-router-dom'


const PromptGrade12List: React.FC = () => {
  const navigate = useNavigate()
  const handleGrade10 = () => navigate('/grade10')
  const handleGrade11 = () => navigate('/grade11')
  // In case grade12 route exists; safe no-op if not configured
  const handleGrade12 = () => navigate('/grade12')
  
  // Subject key mapping for navigation
  const subjectKeyMap: Record<string, string> = {
    'Toán': 'math',
    'Ngữ Văn': 'literature',
    'Tiếng Anh': 'english',
    'Hoá Học': 'chemistry',
    'Lịch Sử': 'history',
    'Địa Lý': 'geography',
    'Tin Học': 'informatics',
    'Công Nghệ': 'technology',
    'Vật Lý': 'physics',
    'Sinh học': 'biology',
  }
  
  // Handler for subject navigation (go to chapters page first)
  const handleSubjectClick = (subjectName: string) => {
    const subjectKey = subjectKeyMap[subjectName] || subjectName.toLowerCase()
    navigate(`/grade/12/${subjectKey}`)
  }

  const features = [
    {
      id: 1,
      title: "Toán 12",
      image: new URL('../../assets/Image/Toan12.png', import.meta.url).href,
      gradient: "from-blue-500 to-purple-600",
      glowColor: "blue-500",
      onClick: () => handleSubjectClick('Toán'),
    },
    {
      id: 2,
      title: "Ngữ Văn 12",
      image: new URL('../../assets/Image/NguVan12.png', import.meta.url).href,
      gradient: "from-green-500 to-emerald-600",
      glowColor: "green-500",
      onClick: () => handleSubjectClick('Ngữ Văn'),
    },
    {
      id: 3,
      title: "Tiếng Anh 12",
      image: new URL('../../assets/Image/TiengAnh12.png', import.meta.url).href,
      gradient: "from-orange-500 to-red-600",
      glowColor: "orange-500",
      onClick: () => handleSubjectClick('Tiếng Anh'),
    },
    {
        id: 4,
        title: "Hoá Học 12",
        image: new URL('../../assets/Image/HoaHoc12.png', import.meta.url).href,
        gradient: "from-orange-500 to-red-600",
        glowColor: "orange-500",
        onClick: () => handleSubjectClick('Hoá Học'),
      },
      {
        id: 5,
        title: "Lịch Sử 12",
        image: new URL('../../assets/Image/LichSu12.png', import.meta.url).href,
        gradient: "from-orange-500 to-red-600",
        glowColor: "orange-500",
        onClick: () => handleSubjectClick('Lịch Sử'),
      },
      {
        id: 6,
        title: "Địa Lý 12",
        image: new URL('../../assets/Image/DiaLy12.png', import.meta.url).href,
        gradient: "from-orange-500 to-red-600",
        glowColor: "orange-500",
        onClick: () => handleSubjectClick('Địa Lý'),
      },
      {
        id: 7,
        title: "Tin Học 12",
        image: new URL('../../assets/Image/TinHoc12.png', import.meta.url).href,
        gradient: "from-orange-500 to-red-600",
        glowColor: "orange-500",
        onClick: () => handleSubjectClick('Tin Học'),
      },
      {
        id: 8,
        title: "Công Nghệ 12",
        image: new URL('../../assets/Image/CongNghe12.png', import.meta.url).href,
        gradient: "from-orange-500 to-red-600",
        glowColor: "orange-500",
        onClick: () => handleSubjectClick('Công Nghệ'),
      },
      {
        id: 9,
        title: "Vật Lý 12",
        image: new URL('../../assets/Image/VatLy12.png', import.meta.url).href,
        gradient: "from-orange-500 to-red-600",
        glowColor: "orange-500",
        onClick: () => handleSubjectClick('Vật Lý'),
      }
  ]

  return (
    <div className="py-8 px-4 bg-[#1a1a2d]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Các Môn Học Khối 12
          </h2>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
            Nền tảng toàn diện cho việc mua, bán và tạo prompt AI dành cho giáo dục
          </p>
        </div>
        {/* Toolbar: Khối selector (centered between text and buttons) */}
        <div className="mb-6 flex justify-center relative z-50">
          <details className="group relative -translate-x-148 z-50">
            <summary className="list-none inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#1a1a2d] border border-[#2f2f4a] text-sm text-neutral-200 cursor-pointer select-none">
              Khối
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 transition-transform group-open:rotate-180">
                <path d="M7 10l5 5 5-5H7z" />
              </svg>
            </summary>
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 w-auto rounded-2xl p-[2px] z-50">
              {/* RGB border blink only, no movement */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[conic-gradient(at_50%_50%,#ff3d3d_0%,#ffbf00_20%,#00ff80_40%,#00c3ff_60%,#8a2be2_80%,#ff3d3d_100%)] animate-pulse opacity-70"></div>
              <div className="relative rounded-[14px] border border-[#2f2f4a] bg-[#23233a] shadow-xl p-2">
                <div className="flex flex-row items-center gap-2 text-sm text-neutral-200 whitespace-nowrap">
                  <button onClick={handleGrade10} className="px-3 py-2 rounded-lg hover:bg-[#2c2c48]">Khối 10</button>
                  <button onClick={handleGrade11} className="px-3 py-2 rounded-lg hover:bg-[#2c2c48]">Khối 11</button>
                  <button onClick={handleGrade12} className="px-3 py-2 rounded-lg hover:bg-[#2c2c48]">Khối 12</button>
                </div>
              </div>
            </div>
          </details>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <button
              key={feature.id}
              onClick={feature.onClick}
              className="group relative bg-[#23233a] rounded-2xl border border-[#2a2a44] hover:border-[#3a3a54] transition-all duration-300 ease-out hover:translate-y-1 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.35)] h-96 overflow-hidden w-full text-left"
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
              
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-2xl "
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
                
            
                {/* Features List */}
                {/* <ul className="space-y-2">
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-sm text-neutral-200">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.gradient} mr-3 flex-shrink-0`}></div>
                      {item}
                    </li>
                  ))}
                </ul> */}
              </div>
              
              {/* Hover Glow Border - thicker and larger */}
              <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-md`}></div>
              {/* Outer Glow Layer */}
              <div className={`pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-60 transition-all duration-500 -z-10 blur-xl`}></div>
            </button>
          ))}
        </div>

        
      </div>
    </div>
  )
}

export default PromptGrade12List