import React from 'react'
import { NavLink } from 'react-router-dom'
import { User } from 'lucide-react'

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
    isActive ? 'bg-[#2c2c48] text-white' : 'text-neutral-300 hover:text-white hover:bg-[#2a2a44]'
  ].join(' ')

const SiderBarMyprofile: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState(false)
  return (
    <aside className={`${collapsed ? 'w-16' : 'w-72'} shrink-0 bg-[#1a1a2d] border-r border-[#2f2f4a] p-4 transition-[width] duration-200 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto z-20`}>
      {/* Toggle */}
      <div className="flex justify-end mb-4 ">
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="h-8 w-8 rounded-lg border border-[#2f2f4a] text-neutral-300 hover:text-white hover:bg-[#2a2a44]"
          aria-label="Đóng/Mở sidebar"
          title={collapsed ? 'Mở sidebar' : 'Đóng sidebar'}
        >
          {collapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 mx-auto">
              <path d="M15.75 19.5l-7.5-7.5 7.5-7.5v15z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 mx-auto">
              <path d="M8.25 4.5l7.5 7.5-7.5 7.5v-15z" />
            </svg>
          )}
        </button>
      </div>
      {/* Profile */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-full border border-[#3a3a5a] bg-[#24243b] text-neutral-200 flex items-center justify-center">
          <User className="h-6 w-6" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-semibold">Tài khoản của tôi</div>
            <div className="text-xs text-neutral-400">Quản lý hồ sơ và prompt</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="space-y-2">
        <NavLink to="/profile" className={(args) => [navItemClass(args), 'w-full', collapsed ? 'justify-center px-0' : ''].join(' ')} end>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0">
            <path d="M12 12a5 5 0 100-10 5 5 0 000 10z" />
            <path d="M2 20a10 10 0 1120 0v1H2v-1z" />
          </svg>
          {!collapsed && <span>Thông tin cá nhân</span>}
        </NavLink>

        <NavLink to="/mystorage" className={(args) => [navItemClass(args), 'w-full', collapsed ? 'justify-center px-0' : ''].join(' ')}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0">
            <path d="M4 5h14v2H4zM4 9h14v2H4zM4 13h10v2H4z" />
            <path d="M20 7h-2v12h2a2 2 0 002-2V9a2 2 0 00-2-2z" />
          </svg>
          {!collapsed && <span>Kho Prompt</span>}
        </NavLink>

        <NavLink to="/myfavorites" className={(args) => [navItemClass(args), 'w-full', collapsed ? 'justify-center px-0' : ''].join(' ')}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.5C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          {!collapsed && <span>Prompt yêu thích</span>}
        </NavLink>
      </nav>
    </aside>
  )
}

export default SiderBarMyprofile


