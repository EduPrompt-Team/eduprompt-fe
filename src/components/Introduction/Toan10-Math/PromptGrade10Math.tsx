
import React from 'react'
import { useNavigate } from 'react-router-dom'


const PromptGrade10List: React.FC = () => {
    const navigate = useNavigate()
    const handleMath10Detail = () => navigate('/grade10/math/detail')
    const handleMath10DetailChuong2 = () => navigate('/grade10/math/detail2')


  const features = [
      {
        id: 1,
        title: "Chương 1",
        image: new URL('../../assets/Image/Toan10.png', import.meta.url).href,
        gradient: "from-blue-500 to-purple-600",
        glowColor: "blue-500",
        description: "Mệnh đề và tập hợp :",
        features: [
          "Mệnh đề",
          "Tập hợp",
          "Các phép toán trên tập hợp",
          "Bài Tập Cuối Chương 1"
        ],
        onClick: handleMath10Detail
      },
    {
      id: 2,
      title: "Chương 2",
      image: new URL('../../assets/Image/Toan10.png', import.meta.url).href,
      gradient: "from-green-500 to-emerald-600",
      glowColor: "green-500",
      description: "Bất phương trình bật nhất 2 ẩn :",
      features: [
        "Bất phương trình bậc nhất 2 ẩn",
        "Hệ bất phương trình bậc nhất 2 ẩn",
        "Bài Tập Cuối Chương 2"
      ],
      onClick: handleMath10DetailChuong2
    },
    {
      id: 3,
      title: "Chương 3",
      image: new URL('../../assets/Image/Toan10.png', import.meta.url).href,
      gradient: "from-orange-500 to-red-600",
      glowColor: "orange-500",
      description: "Hàm số bậc hai và đồ thị :",
      features: [
        "Hàm số và đồ thị",
        "Hàm số bậc 2",
        "Bài Tập Cuối Chương 3"
      ]
    },
        {
          id: 4,
         title: "Chương 4",
         image: new URL('../../assets/Image/Toan10.png', import.meta.url).href,
         gradient: "from-purple-500 to-pink-600",
         glowColor: "purple-500",
         description: "Hệ thức lượng trong tam giác :",
         features: [
           "Giá trị lượng giác của một góc",
           "Định lý cosin",
           "Giải tam giác và ứng dụng",
           "Bài Tập Cuối Chương 4"
         ]
        },
        {
          id: 5,
         title: "Chương 5",
         image: new URL('../../assets/Image/Toan10.png', import.meta.url).href,
         gradient: "from-cyan-500 to-blue-600",
         glowColor: "cyan-500",
         description: "Vector :",
         features: [
           "Khái niệm vector",
           "Tổng và hiệu vector",
           "Tích số với vector",
           "Tích vô hướng vector",
           "Bài Tập Cuối Chương 5"
         ]
        },
        {
          id: 6,
         title: "Chương 6",
         image: new URL('../../assets/Image/Toan10.png', import.meta.url).href,
         gradient: "from-teal-500 to-emerald-600",
         glowColor: "teal-500",
         description: "Thống kê :",
         features: [
           "Số gần đúng và sai số",
           "Biểu diễn dữ liệu",
           "Sơ đồ trung tâm",
           "Độ phân tán",
           "Bài Tập Cuối Chương 6"
         ]
        },
        {
          id: 7,
         title: "Ngoại Khoá",
         image: new URL('../../assets/Image/Toan10.png', import.meta.url).href,
         gradient: "from-rose-500 to-pink-600",
         glowColor: "rose-500",
         description: "Hoạt động thực hành :",
         features: [
           "Máy tính cầm tay",
           "Bảng tính thống kê",
         ]
        },
        {
          id: 8,
         title: "Chương 7",
         image: new URL('../../assets/Image/Toan10.png', import.meta.url).href,
         gradient: "from-indigo-500 to-purple-600",
         glowColor: "indigo-500",
         description: "Phương Pháp Tọa Độ Trong Mặt Phẳng :",
         features: [
           "Hệ trục toạ độ",
           "Phương trình đường thẳng",
           "Phương trình đường tròn",
           "Khoảng cách trong mặt phẳng",
           "Bài Tập Cuối Chương 7"
         ]
        },
        {
          id: 9,
         title: "Chương 8",
         image: new URL('../../assets/Image/Toan10.png', import.meta.url).href,
         gradient: "from-yellow-500 to-orange-600",
         glowColor: "yellow-500",
         description: "Bất phương trình bậc hai 1 ẩn :",
         features: [
           "Bất phương trình bậc hai",
           "Hệ phương trình và bất phương trình bậc 2",
           "Ứng dụng trong thực tế",
           "Bài Tập Cuối Chương 8"
         ]
        },
        {
          id: 10,
         title: "Chương 9",
         image: new URL('../../assets/Image/Toan10.png', import.meta.url).href,
         gradient: "from-lime-500 to-green-600",
         glowColor: "lime-500",
         description: "Đại số tổ hợp :",
         features: [
           "Quy tắc đếm",
           "Chỉnh hợp, hoán vị và tổ hợp",
           "Nhị thức Newton",
           "Bài Tập Cuối Chương 9"
         ]
        },
        {
          id: 11,
         title: "Chương 10",
         image: new URL('../../assets/Image/Toan10.png', import.meta.url).href,
         gradient: "from-sky-500 to-cyan-600",
         glowColor: "sky-500",
         description: "Xác suất :",
         features: [
           "Quy tắc xác suất",
           "Biến cố và xác suất",
           "Bài Tập Cuối Chương 10"
         ]
        },
        {
          id:12 ,
         title: "Ngoại Khoá 2",
         image: new URL('../../assets/Image/Toan10.png', import.meta.url).href,
         gradient: "from-violet-500 to-purple-600",
         glowColor: "violet-500",
         description: "Hoạt động thực hành :",
         features: [
           "Bài toán thực tế xác suất",
           "Sử dụng phần mềm tính xác suất"
         ]
        }
  ]

  return (
    <div className="py-8 px-4 bg-[#1a1a2d]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Các Môn Học Khối 10
          </h2>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
            Nền tảng toàn diện cho việc mua, bán và tạo prompt AI dành cho giáo dục
          </p>
        </div>

         {/* Học kỳ 1 Section */}
         <div className="mb-12">
           <div className="flex items-center justify-between mb-8">
             {/* Toolbar: Khối selector - Left */}
             <div className="relative z-50">
               <details className="group relative z-50">
                 <summary className="list-none inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#1a1a2d] border border-[#2f2f4a] text-sm text-neutral-200 cursor-pointer select-none">
                   Khối
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 transition-transform group-open:rotate-180">
                     <path d="M7 10l5 5 5-5H7z" />
                   </svg>
                 </summary>
                 <div className="absolute left-full -top-2 ml-2 w-auto rounded-2xl p-[2px] z-50">
                   {/* RGB border blink only, no movement */}
                   <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[conic-gradient(at_50%_50%,#ff3d3d_0%,#ffbf00_20%,#00ff80_40%,#00c3ff_60%,#8a2be2_80%,#ff3d3d_100%)] animate-pulse opacity-70"></div>
                   <div className="relative rounded-[14px] border border-[#2f2f4a] bg-[#23233a] shadow-xl p-2">
                     <div className="flex flex-row items-center gap-2 text-sm text-neutral-200 whitespace-nowrap">
                       <button className="px-3 py-2 rounded-lg hover:bg-[#2c2c48]">Khối 10</button>
                       <button className="px-3 py-2 rounded-lg hover:bg-[#2c2c48]">Khối 11</button>
                       <button className="px-3 py-2 rounded-lg hover:bg-[#2c2c48]">Khối 12</button>
                     </div>
                   </div>
                 </div>
               </details>
             </div>
             
             {/* Học kỳ 1 - Center */}
             <div className="relative inline-block p-2 -ml-22">
               {/* RGB Border Animation for title */}
               <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[conic-gradient(at_50%_50%,#ff3d3d_0%,#ffbf00_20%,#00ff80_40%,#00c3ff_60%,#8a2be2_80%,#ff3d3d_100%)] animate-pulse opacity-100"></div>
               <div className="relative bg-[#1a1a2d] px-6 py-3 rounded-xl border-2 border-transparent">
                 <h3 className="text-3xl font-bold text-white mb-2">Học kỳ 1</h3>
                 <div className="w-24 bg-gradient-to-r mx-auto rounded-full"></div>
               </div>
             </div>
             
             {/* Empty div for spacing */}
             <div></div>
           </div>
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             {features.filter(feature => feature.id >= 1 && feature.id <= 7).map((feature, index) => (
               <button
                 key={feature.id}
                 onClick={feature.onClick}
                 className="group relative bg-[#23233a] rounded-2xl border border-[#2a2a44] hover:border-[#3a3a54] transition-all duration-300 hover:scale-105 hover:shadow-2xl h-96 overflow-hidden w-full text-left"
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
                   <div className="absolute inset-0 bg-black/75 rounded-2xl"></div>
                 </div>
                 
                 {/* Content Overlay */}
                 <div className="relative z-10 h-full flex flex-col justify-end p-6">
                   {/* Title */}
                   <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                     {feature.title}
                   </h3>
                   
                   {/* Description */}
                   <p className="text-sm text-neutral-300 mb-3 line-clamp-1 group-hover:text-neutral-200 transition-colors duration-300">
                     {feature.description}
                   </p>
                   
                   {/* Features List */}
                   <ul className="space-y-1">
                     {feature.features?.slice(0, 4).map((item, itemIndex) => (
                       <li key={itemIndex} className="flex items-center text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors duration-300">
                         <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${feature.gradient} mr-2 flex-shrink-0`}></div>
                         <span className="line-clamp-1">{item}</span>
                       </li>
                     ))}
                   </ul>
                 </div>
                 
                 {/* Hover Glow Border - thicker and larger */}
                 <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-md`}></div>
                 {/* Outer Glow Layer */}
                 <div className={`pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-60 transition-all duration-300 -z-10 blur-xl`}></div>
               </button>
             ))}
           </div>
         </div>

         {/* Học kỳ 2 Section */}
         <div className="mb-12">
           <div className="text-center mb-8">
             <div className="relative inline-block p-1">
               {/* RGB Border Animation for title */}
               <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[conic-gradient(at_50%_50%,#ff3d3d_0%,#ffbf00_20%,#00ff80_40%,#00c3ff_60%,#8a2be2_80%,#ff3d3d_100%)] animate-pulse opacity-100"></div>
               <div className="relative bg-[#1a1a2d] px-6 py-3 rounded-xl border-2 border-transparent">
                 <h3 className="text-3xl font-bold text-white mb-2">Học kỳ 2</h3>
                 <div className="w-24 bg-gradient-to-r mx-auto rounded-full"></div>
               </div>
             </div>
           </div>
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             {features.filter(feature => feature.id >= 8 && feature.id <= 12).map((feature, index) => (
               <button
                 key={feature.id}
                 className="group relative bg-[#23233a] rounded-2xl border border-[#2a2a44] hover:border-[#3a3a54] transition-all duration-300 hover:scale-105 hover:shadow-2xl h-96 overflow-hidden w-full text-left"
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
                   <div className="absolute inset-0 bg-black/75 rounded-2xl"></div>
                 </div>
                 
                 {/* Content Overlay */}
                 <div className="relative z-10 h-full flex flex-col justify-end p-6">
                   {/* Title */}
                   <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                     {feature.title}
                   </h3>
                   
                   {/* Description */}
                   <p className="text-sm text-neutral-300 mb-3 line-clamp-1 group-hover:text-neutral-200 transition-colors duration-300">
                     {feature.description}
                   </p>
                   
                   {/* Features List */}
                   <ul className="space-y-1">
                     {feature.features?.slice(0, 4).map((item, itemIndex) => (
                       <li key={itemIndex} className="flex items-center text-xs text-neutral-400 group-hover:text-neutral-300 transition-colors duration-300">
                         <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${feature.gradient} mr-2 flex-shrink-0`}></div>
                         <span className="line-clamp-1">{item}</span>
                       </li>
                     ))}
                   </ul>
                 </div>
                 
                 {/* Hover Glow Border - thicker and larger */}
                 <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-md`}></div>
                 {/* Outer Glow Layer */}
                 <div className={`pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-60 transition-all duration-300 -z-10 blur-xl`}></div>
               </button>
             ))}
           </div>
         </div>

        
      </div>
    </div>
  )
}

export default PromptGrade10List
// export default PromptGrade10Math
