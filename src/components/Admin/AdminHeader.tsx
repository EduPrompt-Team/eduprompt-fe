import React from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from 'lucide-react'
import { getCurrentUser, fetchCurrentUser, clearTokens, setCurrentUser } from '@/lib/api'
import { checkIsAdmin } from '@/utils/auth'

const AdminHeader: React.FC = () => {
  const navigate = useNavigate()
  const [user, setUser] = React.useState<any | null>(() => getCurrentUser())

  React.useEffect(() => {
    if (!user && (localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken'))){
      fetchCurrentUser().then(setUser).catch(() => setCurrentUser(null))
    }
  }, [])

  // Enforce admin-only usage for admin header
  React.useEffect(() => {
    const u = getCurrentUser()
    if (!u) return
    if (!checkIsAdmin(u)) {
      // Non-admin accessing admin header context → redirect to home
      navigate('/home')
    }
  }, [navigate])

  const handleLogin = () => navigate('/login')
  const handleLogout = () => { clearTokens(); setCurrentUser(null); navigate('/login') }
  const goProfile = () => navigate('/admin/viewprofile')

  return (
    <header className="w-full sticky top-0 z-50 bg-[#17172b] border-b border-[#2a2a44]">
      <div className="mx-auto max-w-7xl h-14 flex items-center justify-between px-5">
        {/* Logo → go to admin dashboard */}
        <button onClick={() => navigate('/admin/dashboard')} className="flex items-center gap-2">
          <img
            src={new URL('../../assets/Image/LogoEduPrompt.png', import.meta.url).href}
            alt="EduPrompt"
            className="h-7 w-7 object-contain"
          />
          <span className="text-white text-lg font-semibold tracking-wide">EduPrompt</span>
        </button>

        {/* Right: profile icon (admin only) + login/logout */}
        <div className="flex items-center gap-3">
          {user && checkIsAdmin(user) && (
            <button
              type="button"
              onClick={goProfile}
              title={user.fullName || user.email}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-300 hover:text-white hover:bg-[#2a2a44]"
            >
              <User className="h-5 w-5" />
            </button>
          )}
          {user ? (
            <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg bg-[#2a2a44] text-neutral-200 hover:bg-[#34345a] text-sm">
              Đăng xuất
            </button>
          ) : (
            <button onClick={handleLogin} className="px-3 py-1.5 rounded-lg bg-white text-[#23233a] hover:bg-white/90 text-sm font-semibold">
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default AdminHeader


