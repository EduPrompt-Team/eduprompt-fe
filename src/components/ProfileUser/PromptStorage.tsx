import React from 'react'
import { useNavigate } from 'react-router-dom'

const PromptStorage: React.FC = () => {
  const navigate = useNavigate()
  const imageCh1 = new URL('../../assets/Image/Toan10.png', import.meta.url).href
  const handleMath10Detail = () => {
    navigate('/payment')
  }

  return (
    <div className="py-8 px-10">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold">Kho Prompt</h1>
        <p className="text-neutral-400 mt-1">Quản lý và xem lại các prompt đã lưu</p>
        <div className="mt-4 h-0.5 -mx-10 bg-white"></div>

        
        {/* Only one compact card like PromptGrade10Math tiles */}
        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <button
            onClick={handleMath10Detail}
            className="group relative bg-[#23233a] rounded-2xl border border-[#2a2a44] hover:border-[#3a3a54] transition-all duration-300 hover:scale-105 hover:shadow-2xl h-96 overflow-hidden w-full text-left"
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-2xl"
              style={{ backgroundImage: 'url(' + imageCh1 + ')' }}
            >
              <div className="absolute inset-0 bg-black/75 rounded-2xl"></div>
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10 pb-6 md:pb-12">
              <h3 className="mt-2 text-2xl font-bold text-white mb-2">Chương 1</h3>
              <p className=" text-sm text-neutral-300 mb-2">Mệnh đề và tập hợp :</p>
              <ul className="space-y-1">
                {['Mệnh đề','Tập hợp','Các phép toán trên tập hợp','Bài Tập Cuối Chương 1'].map((item, idx) => (
                  <li key={idx} className="flex items-center text-xs text-neutral-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mr-2 flex-shrink-0"></div>
                    <span className="line-clamp-1">{item}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <div className="mt-10 flex gap-2">
                <button
                  className="inline-flex items-center gap-2 px-5 md:px-6 py-2 md:py-2.5 rounded-full bg-gradient-to-r from-pink-700 to-pink-500 hover:from-pink-600 hover:to-pink-400 text-white text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md hover:shadow-lg"
                >
                  Lấy Prompt
                </button>
              </div>
            </div>

            {/* Hover glows like tiles */}
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-md"></div>
            <div className="pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-60 transition-all duration-300 -z-10 blur-xl"></div>
          </button>
        </div>
      </div>
  )
}

export default PromptStorage


