import React from 'react'
import { useNavigate } from 'react-router-dom'

const PaymentPrompt: React.FC = () => {
    const navigate = useNavigate()
    const handlePayment = () => {
        navigate('/grade10/math/detail/chuong1')
    }
  return (
    <main className="flex-1 text-white">
      {/* Header with line (style matches other pages) */}
      <div className="px-10 pt-6 md:pt-10">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-bold">Thanh toán</h1>
          <p className="text-neutral-400 mt-1">Thanh toán qua PayOS một cách an toàn</p>
        </div>
        <div className="mt-4 h-0.5 -mx-10 bg-white"></div>
      </div>

      {/* Content area uses same content background cards as MyProfile */}
      <div className="max-w-5xl mx-auto p-6 md:p-10 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Summary */}
          <div className="relative rounded-2xl p-[2px] overflow-hidden self-start mt-4 md:mt-30">
             <div className="absolute inset-0 rounded-2xl bg-[conic-gradient(at_50%_90%,#ff3d3d_0%,#ffbf00_20%,#00ff80_40%,#00c3ff_60%,#8a2be2_80%,#ff3d3d_100%)] opacity-60"></div>
             <div className="relative z-10 rounded-[14px] border border-[#2f2f4a] bg-[#1a1a2d] p-6">
              <h2 className="text-lg font-semibold">Tóm tắt đơn hàng</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between text-neutral-300">
                  <span>Gói Prompt</span>
                  <span>EduPrompt Premium</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Số lượng</span>
                  <span>1</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Thuế</span>
                  <span>0 VND</span>
                </div>
                <div className="border-t border-[#2f2f4a] pt-3 flex justify-between">
                  <span className="font-semibold">Tổng</span>
                  <span className="font-semibold text-green-400">500.000 VND</span>
                </div>
              </div>
            </div>
          </div>

          {/* PayOS Panel */}
          <div className="relative rounded-2xl p-[2px] overflow-hidden self-start">
             <div className="absolute inset-0 rounded-2xl bg-[conic-gradient(at_50%_90%,#ff3d3d_0%,#ffbf00_20%,#00ff80_40%,#00c3ff_60%,#8a2be2_80%,#ff3d3d_100%)] opacity-60"></div>
             <div className="relative z-10 rounded-[14px] border border-[#2f2f4a] bg-[#1a1a2d] p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Thanh toán với PayOS</h2>
                <span className="text-xs text-neutral-400">Sandbox</span>
              </div>

              {/* Inputs */}
              <div className="mt-4 grid grid-cols-1 gap-3">
                <label className="text-sm text-neutral-400">
                  Số tiền (VND)
                  <input className="mt-1 w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4c4cab]" defaultValue="199000" />
                </label>
                <label className="text-sm text-neutral-400">
                  Nội dung thanh toán
                  <input className="mt-1 w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4c4cab]" defaultValue="Thanh toan EduPrompt Premium" />
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="text-sm text-neutral-400">
                    Order ID
                    <input className="mt-1 w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4c4cab]" defaultValue={`ORD-${Date.now()}`} />
                  </label>
                  <label className="text-sm text-neutral-400">
                    Email
                    <input className="mt-1 w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#4c4cab]" placeholder="you@example.com" />
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 flex flex-wrap gap-3">
                <button onClick={handlePayment} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5 active:scale-95 shadow-md hover:shadow-lg">
                  Thanh toán PayOS
                </button>
                <button className="px-5 py-2.5 rounded-full bg-[#2a2a44] hover:bg-[#3a3a54] text-white text-sm font-medium">
                  Sao chép link thanh toán
                </button>
              </div>

              {/* QR placeholder */}
              <div className="mt-5 rounded-lg border border-dashed border-[#2f2f4a] bg-[#23233a] p-6 text-center text-neutral-400">
                QR PayOS sẽ hiển thị tại đây sau khi tạo đơn hàng
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default PaymentPrompt


