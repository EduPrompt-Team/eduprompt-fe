import React from 'react';
import { useNavigate } from 'react-router-dom';

const PromptList: React.FC = () => {
  const navigate = useNavigate()

  const handleLogin = () => {
    navigate('/login')
  }

  const handleGrade10 = () => {
    navigate('/grade10')
  }

  const handleGrade11 = () => {
    navigate('/grade11')
  }

  const handleGrade12 = () => {
    navigate('/grade12')
  }

  const grades = [
    {
      id: 1,
    //   title: "Khối 10",
    //   description: "Tìm kiếm và thuê các chuyên gia AI tạo prompt chuyên nghiệp cho học sinh lớp 10",
      image: new URL('../../assets/Image/Khoi10.png', import.meta.url).href,
      gradient: "from-blue-500 to-purple-600  ",
      glowColor: "blue-500",
    //   features: ["Hỗ trợ soạn giáo án", "Hỗ trợ soạn bài kiểm tra", "Prompt tuỳ chỉnh", "Đảm bảo chất lượng"]
    },
    {
      id: 2,
      // title: "Khối 11",
      // description: "Công cụ mạnh mẽ để tạo prompt AI chuyên nghiệp và hiệu quả cho học sinh lớp 11",
      image: new URL('../../assets/Image/Khoi11.png', import.meta.url).href,
      gradient: "from-green-500 to-emerald-600",
      glowColor: "green-500",
      // features: ["Hỗ trợ soạn giáo án", "Hỗ trợ soạn bài kiểm tra", "Prompt tuỳ chỉnh", "Đảm bảo chất lượng"]
    },
    {
      id: 3,
      // title: "Khối 12",
      // description: "Bán và chia sẻ prompt của bạn với cộng đồng giáo viên và học sinh lớp 12",
      image: new URL('../../assets/Image/Khoi12.png', import.meta.url).href,
      gradient: "from-orange-500 to-red-600",
      glowColor: "orange-500",
      // features: ["Hỗ trợ soạn giáo án", "Hỗ trợ soạn bài kiểm tra", "Prompt tuỳ chỉnh", "Đảm bảo chất lượng"]
    }
  ];

  return (
    <div className="py-4 px-4 bg-[#1a1a2d]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Chọn Khối Học
          </h2>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
            Nền tảng toàn diện cho việc mua, bán và tạo prompt AI dành cho giáo dục
          </p>
        </div>

        {/* Grades Grid - 3 columns horizontal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {grades.map((grade, index) => (
            <button
              key={grade.id}
              onClick={() => { if (grade.id === 1) handleGrade10(); if (grade.id === 2) handleGrade11(); if (grade.id === 3) handleGrade12(); }}
              className="group relative bg-transparent rounded-2xl border-2 border-[#2a2a44] hover:border-[#3a3a54] transition-all duration-300 hover:scale-105 hover:shadow-2xl h-96 overflow-hidden w-full text-left"
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-2xl"
                style={{ backgroundImage: `url(${grade.image})` }}
              >
                <div className="absolute inset-0 bg-black/40 rounded-2xl"></div>
              </div>
              
              {/* Content Overlay */}
              <div className="relative z-10 h-full flex flex-col justify-end p-8">
                {/* Title */}
                {/* <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                  {grade.title}
                </h3> */}
                
                {/* Description
                <p className="text-neutral-200 mb-6 leading-relaxed">
                  {grade.description}
                </p> */}
                
                {/* Features List */}
                {/* <ul className="space-y-2">
                  {grade.features.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-sm text-neutral-200">
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${grade.gradient} mr-3 flex-shrink-0`}></div>
                      {item}
                    </li>
                  ))}
                </ul> */}
              </div>
              
              {/* Hover Glow Border */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${grade.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm`}></div>
            </button>
            
          ))}
        </div>
        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-[#23233a] to-[#2a2a44] rounded-2xl p-8 border border-[#3a3a54]">
            <h3 className="text-3xl font-bold text-white mb-4">
              Sẵn sàng bắt đầu?
            </h3>
            <p className="text-neutral-400 mb-8 max-w-2xl mx-auto">
              Tham gia cộng đồng giáo viên sử dụng AI để nâng cao chất lượng giảng dạy
            </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={handleLogin}
                  className="px-8 py-4 bg-gradient-to-r from-rose-400 to-orange-400 text-white font-semibold rounded-xl hover:from-rose-500 hover:to-orange-500 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Đăng nhập
                </button>
              <button className="px-8 py-4 border border-[#4c4cab] text-[#4c4cab] font-semibold rounded-xl hover:bg-[#4c4cab] hover:text-white transition-all duration-300">
                Tìm hiểu thêm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptList;
