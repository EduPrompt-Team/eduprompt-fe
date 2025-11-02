import React from 'react'
import { User, ShoppingBag, Heart, ChevronDown, Wallet, Package } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  [
    'px-4 py-2 rounded-full text-sm transition-colors',
    isActive ? 'bg-[#3a3a5a] text-white' : 'text-neutral-300 hover:text-white',
  ].join(' ')

const HeaderHomepage: React.FC = () => {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = React.useState(false)

  const handleLogin = () => {
    navigate('/login')
  }

//   const handleGrade10 = () => {
//     navigate('/grade10')
//   }

//   const handleGrade11 = () => {
//     navigate('/grade11')
//   }

//   const handleGrade12 = () => {
//     navigate('/grade12')
//   }

  return (
    <header className="w-full sticky top-0 z-50 bg-[#23233a]/95 backdrop-blur border-b border-[#2a2a44] shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.03)]">
      <div className="mx-auto max-w-7xl h-16 md:h-18 flex items-center gap-3 px-5">
        {/* Left: Logo + brand */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src={new URL('../../assets/Image/LogoEduPrompt.png', import.meta.url).href}
            alt="EduPrompt"
            className="h-7 w-7 md:h-8 md:w-8 object-contain"
          />
          <span className="text-white text-lg md:text-xl font-bold tracking-wide">EduPrompt</span>
        </Link>
        {/* Phân Loại */}
        <div className="relative hidden md:block ml-3">
          <details className="group">
            <summary className="list-none inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a2d] border border-[#2f2f4a] text-sm text-neutral-200 cursor-pointer select-none">
              Phân Loại
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 transition-transform group-open:rotate-180">
                <path d="M7 10l5 5 5-5H7z" />
              </svg>
            </summary>
            <div className="absolute mt-2 -left-60 z-50">
              {/* Wrapper with RGB border only */}
              <div className="relative rounded-2xl p-[2px] overflow-hidden">
                {/* Blinking overlay for border */}
                <div className="absolute inset-0 -z-10 bg-[conic-gradient(at_50%_50%,#ff3d3d_0%,#ffbf00_20%,#00ff80_40%,#00c3ff_60%,#8a2be2_80%,#ff3d3d_100%)] opacity-80 animate-pulse"></div>
                {/* Panel */}
                <div className="relative w-290 rounded-[14px] border border-[#2f2f4a] bg-[#23233a] shadow-xl p-2">
                  <div className="flex flex-wrap gap-1 text-sm text-neutral-200">
                <button className="px-3 py-2 rounded-lg hover:bg-[#2c2c48] whitespace-nowrap">Chương 1</button>
                <button className="px-3 py-2 rounded-lg hover:bg-[#2c2c48] whitespace-nowrap">Chương 2</button>
                <button className="px-3 py-2 rounded-lg hover:bg-[#2c2c48] whitespace-nowrap">Chương 3</button>
                <button className="px-3 py-2 rounded-lg hover:bg-[#2c2c48] whitespace-nowrap">Chương 4</button>
                <button className="px-3 py-2 rounded-lg hover:bg-[#2c2c48] whitespace-nowrap">Chương 5</button>
                <button className="px-3 py-2 rounded-lg hover:bg-[#2c2c48] whitespace-nowrap">Chương 6</button>
                <button className="px-3 py-2 rounded-lg hover:bg-[#2c2c48] whitespace-nowrap">Chương 7</button>
                <button className="px-3 py-2 rounded-lg hover:bg-[#2c2c48] whitespace-nowrap">Chương 8</button>
                <button className="px-3 py-2 rounded-lg hover:bg-[#2c2c48] whitespace-nowrap">Chương 9</button>
                <button className="px-3 py-2 rounded-lg hover:bg-[#2c2c48] whitespace-nowrap">Chương 10</button>
                <button className="px-3 py-2 rounded-lg hover:bg-[#2c2c48] whitespace-nowrap">Ngoại Khóa 1</button>
                <button className="px-3 py-2 rounded-lg hover:bg-[#2c2c48] whitespace-nowrap">Ngoại Khóa 2</button>
              </div>
              </div>
              </div>
            </div>
          </details>
        </div>

        {/* Search bar */}
        <div className="flex-1 hidden md:flex items-center md:ml-4">
          <div className="relative w-full max-w-xl">
            <input
              type="text"
              placeholder="Tìm prompt, tác giả, chủ đề..."
              className="w-full h-10 rounded-full bg-[#1a1a2d] border border-[#2f2f4a] px-10 text-sm text-neutral-100 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-[#4c4cab]"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400"
            >
              <path d="M10 2a8 8 0 105.293 14.293l3.707 3.707 1.414-1.414-3.707-3.707A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z" />
            </svg>
          </div>
        </div>
            {/* Center: Navigation + Category + Search */}
            <nav className="hidden lg:flex items-center gap-2 ml-4">
          <NavLink to="/packages" className={navItemClass}>
            Gói Prompt
          </NavLink>
          <NavLink to="/Hire" className={navItemClass}>
            Mua Prompt
          </NavLink>
          <NavLink to="/Sell" className={navItemClass}>
            Bán Prompt
          </NavLink>
        </nav>

        {/* Right: actions */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleLogin}
            className="hidden md:inline-flex h-10 items-center justify-center rounded-full bg-white text-[#23233a] px-4 text-sm font-semibold hover:bg-white/90"
          >
            Đăng nhập
          </button>

        <button
          type="button"
          aria-label="Notifications"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-300 hover:text-white hover:bg-[#3a3a5a]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M12 22a2 2 0 002-2h-4a2 2 0 002 2z" />
            <path d="M18 14V9a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2z" />
          </svg>
        </button>

        <button
          type="button"
          aria-label="Messages"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-300 hover:text-white hover:bg-[#3a3a5a]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M7 8h10v2H7zM7 12h6v2H7z" />
            <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8l-4 3V6a2 2 0 0 1 2-2zm0 2v13.17L7.17 16H20V6H4z" />
          </svg>
        </button>

        {/* Avatar */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex items-center gap-1 h-9 px-2 rounded-full border border-[#3a3a5a] bg-[#24243b] text-neutral-200"
            aria-label="Tài khoản"
          >
            <div className="h-7 w-7 rounded-full flex items-center justify-center bg-[#2b2b45]">
              <User className="h-4 w-4" />
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-[#2f2f4a] bg-[#23233a] shadow-xl p-2 z-50">
              <button onClick={() => { setMenuOpen(false); navigate('/profile') }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-200 hover:bg-[#2c2c48]">
                <User className="h-5 w-5" />
                <span>Thông tin cá nhân</span>
              </button>
              <button onClick={() => { setMenuOpen(false); navigate('/wallet') }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-200 hover:bg-[#2c2c48]">
                <Wallet className="h-5 w-5" />
                <span>Ví cá nhân</span>
              </button>
              <button onClick={() => { setMenuOpen(false); navigate('/mystorage') }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-200 hover:bg-[#2c2c48]">
                <ShoppingBag className="h-5 w-5" />
                <span>Kho Prompt</span>
              </button>
              <button onClick={() => { setMenuOpen(false); navigate('/myfavorites') }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-200 hover:bg-[#2c2c48]">
                <Heart className="h-5 w-5" />
                <span>Prompt yêu thích</span>
              </button>
              <button onClick={() => { setMenuOpen(false); navigate('/my-packages') }} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-200 hover:bg-[#2c2c48]">
                <Package className="h-5 w-5" />
                <span>Quản lý gói</span>
              </button>
              
            </div>
          )}
        </div>
        </div>
      </div>
    </header>
  )
}

export default HeaderHomepage


