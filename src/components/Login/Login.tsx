import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setTokens, fetchCurrentUser, setRemember } from '@/lib/api'
import { GoogleLogin } from '@react-oauth/google'
import { useToast } from '@/components/ui/toast'
import { authService } from '@/services/authService'

function GoogleIcon() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
			<path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.651 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/>
			<path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 18.961 14 24 14c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
			<path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.197l-6.196-5.238C29.135 35.091 26.715 36 24 36c-5.205 0-9.62-3.322-11.284-7.954l-6.51 5.02C9.507 39.556 16.227 44 24 44z"/>
			<path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.793 2.236-2.231 4.166-4.094 5.565l.003-.002 6.196 5.238C39.062 36.023 44 30.5 44 24c0-1.341-.138-2.651-.389-3.917z"/>
		</svg>
	)
}

const Login: React.FC = () => {
	const navigate = useNavigate()
	const { showToast } = useToast()
    const [isRegister, setIsRegister] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [remember, setRememberState] = useState(false)

  useEffect(() => {
    // Debug FE env and origin to troubleshoot Google client configuration
    // @ts-ignore
    console.log('VITE_GOOGLE_CLIENT_ID =', import.meta.env.VITE_GOOGLE_CLIENT_ID)
    console.log('ORIGIN =', location.origin)

    // Hydrate remember state and saved email
    try {
      const savedRemember = localStorage.getItem('rememberMe')
      const savedEmail = localStorage.getItem('rememberEmail')
      if (savedRemember === 'true') {
        setRememberState(true)
        if (savedEmail) setEmail(savedEmail)
      }
    } catch {}
  }, [])
    const handleEmailPasswordLogin = async () => {
        if (!email || !password) {
            showToast('Vui lòng nhập email và mật khẩu', 'warning')
            return
        }
        setSubmitting(true)
        setRemember(remember)
        try {
            const { data } = await api.post('/api/auth/login', { email, password })
            // Backend trả về TokenResponseDto { accessToken, refreshToken }
            setTokens(data.accessToken, data.refreshToken)
            await fetchCurrentUser()
            // Trigger custom event to notify headers/user components
            window.dispatchEvent(new CustomEvent('user-logged-in'))
            // Persist remember choices
            try {
              if (remember) {
                localStorage.setItem('rememberMe', 'true')
                localStorage.setItem('rememberEmail', email)
              } else {
                localStorage.setItem('rememberMe', 'false')
                localStorage.removeItem('rememberEmail')
              }
            } catch {}
            navigate('/home', { replace: true })
        } catch (e: any) {
            const message = e?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
            showToast(message, 'error')
        } finally {
            setSubmitting(false)
        }
    }

    const handleRegister = async () => {
        if (!email || !password || !fullName) {
            showToast('Vui lòng điền đầy đủ thông tin (Email, Mật khẩu, Họ tên)', 'warning')
            return
        }
        if (password.length < 6) {
            showToast('Mật khẩu phải có ít nhất 6 ký tự', 'warning')
            return
        }
        setSubmitting(true)
        try {
            await authService.register({ email, password, fullName, phone: phone || undefined })
            await fetchCurrentUser()
            window.dispatchEvent(new CustomEvent('user-logged-in'))
            showToast('Đăng ký thành công!', 'success')
            navigate('/home', { replace: true })
        } catch (e: any) {
            const message = e?.response?.data?.message || e?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
            showToast(message, 'error')
        } finally {
            setSubmitting(false)
        }
    }

	return (
    <div className="min-h-screen bg-[#1a1a2d] text-neutral-100 flex items-start justify-center px-4 pt-6 md:pt-8">
            <div className="relative w-full max-w-lg bg-[#23233a] border border-black/30 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm rounded-2xl rgb-pulse fade-in">
                    <div className="p-7 pb-3 flex flex-col items-center space-y-3">
                        <div className="h-16 w-16 overflow-hidden rounded-lg slide-up">
                            <img src={new URL('../../assets/Image/LogoEduPrompt.png', import.meta.url).href} alt="EduPrompt" className="h-15 w-20 object-contain scale-150 origin-center" />
                        </div>
                    <h3 className="text-3xl tracking-tight font-semibold slide-up anim-delay-100">
                        {isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}
                    </h3>
                    <p className="text-neutral-400 text-center text-sm slide-up anim-delay-200">Nền tảng hỗ trợ tìm kiếm prompt chuẩn AI dành cho giáo viên THPT</p>
                </div>
                <div className="p-7 space-y-5">
                    <div className="w-full h-11 flex items-center justify-center slide-up anim-delay-150">
                        <GoogleLogin
                          onSuccess={async (res) => {
                            try {
                              const idToken = (res as any).credential
                              const { data } = await api.post('/api/auth/google-login', { idToken })
                              setTokens(data.accessToken, data.refreshToken)
                              await fetchCurrentUser()
                              // Trigger custom event to notify headers/user components
                              window.dispatchEvent(new CustomEvent('user-logged-in'))
                              navigate('/home', { replace: true })
                            } catch (e) {
                              console.error(e)
                              showToast('Đăng nhập Google thất bại', 'error')
                            }
                          }}
                          onError={() => showToast('Google Login lỗi', 'error')}
                        />
                    </div>
                    <div className="flex items-center gap-4 px-2 slide-up anim-delay-200">
                        <div className="h-px flex-1 bg-neutral-700/60" />
                        <span className="text-xs text-neutral-500">hoặc tiếp tục với email</span>
                        <div className="h-px flex-1 bg-neutral-700/60" />
                    </div>
                    {isRegister && (
                        <div className="grid gap-2 slide-up anim-delay-250">
                            <label className="text-sm text-neutral-300">Họ và tên <span className="text-red-400">*</span></label>
                            <input
                                type="text"
                                placeholder="Nguyễn Văn A"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="bg-neutral-800/90 border border-neutral-700 rounded-xl h-11 px-3 text-neutral-100 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600"
                            />
                        </div>
                    )}
                    <div className="grid gap-2 slide-up anim-delay-250">
                        <label className="text-sm text-neutral-300">Địa chỉ email <span className="text-red-400">*</span></label>
                        <input
                            type="email"
                            placeholder="email@vidu.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-neutral-800/90 border border-neutral-700 rounded-xl h-11 px-3 text-neutral-100 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600"
                        />
                    </div>
                    <div className="grid gap-2 slide-up anim-delay-300">
                        <label className="text-sm text-neutral-300">Mật khẩu <span className="text-red-400">*</span></label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-neutral-800/90 border border-neutral-700 rounded-xl h-11 px-3 text-neutral-100 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600"
                        />
                        {isRegister && (
                            <p className="text-xs text-neutral-500">Mật khẩu phải có ít nhất 6 ký tự</p>
                        )}
                    </div>
                    {isRegister && (
                        <div className="grid gap-2 slide-up anim-delay-350">
                            <label className="text-sm text-neutral-300">Số điện thoại (tùy chọn)</label>
                            <input
                                type="tel"
                                placeholder="0123456789"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="bg-neutral-800/90 border border-neutral-700 rounded-xl h-11 px-3 text-neutral-100 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600"
                            />
                        </div>
                    )}
                </div>
                <div className="px-7 pb-7 pt-0 flex flex-col items-stretch gap-4">
                    <button 
                        onClick={isRegister ? handleRegister : handleEmailPasswordLogin}
                        className="w-full h-11 rounded-xl bg-gradient-to-r from-rose-400 to-orange-400 text-neutral-900 font-semibold hover:opacity-90 slide-up anim-delay-300 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg active:shadow-sm hover:from-rose-500 hover:to-orange-500"
                        disabled={submitting}
                    >
                        {submitting ? (isRegister ? 'Đang đăng ký...' : 'Đang đăng nhập...') : (isRegister ? 'Đăng ký' : 'Đăng nhập')}
                    </button>
                    {!isRegister && (
                        <div className="flex items-start gap-2 text-xs text-neutral-400 slide-up anim-delay-400">
                            <input id="updates" type="checkbox" checked={remember} onChange={(e) => setRememberState(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-rose-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-600" />
                            <label htmlFor="updates" className="leading-relaxed">
                              Ghi nhớ tài khoản
                            </label>
                        </div>
                    )}
                    {isRegister && (
                        <p className="text-xs text-neutral-500 text-center leading-relaxed slide-up anim-delay-400">
                            Bằng việc tạo tài khoản, bạn đồng ý với <a className="underline underline-offset-2" href="#">điều khoản dịch vụ</a>.
                        </p>
                    )}
                    <button 
                        onClick={() => {
                            setIsRegister(!isRegister)
                            setFullName('')
                            setPhone('')
                        }}
                        className="text-sm text-neutral-300 hover:text-white underline underline-offset-2 slide-up anim-delay-400"
                    >
                        {isRegister ? 'Tôi đã có tài khoản' : 'Chưa có tài khoản? Đăng ký'}
                    </button>
                </div>
            </div>
		</div>
	)
}

export default Login



