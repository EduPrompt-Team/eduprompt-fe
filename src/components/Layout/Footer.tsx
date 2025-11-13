import React from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Facebook, Youtube, Instagram, Linkedin, ArrowUpRight } from 'lucide-react'

const footerLinks = [
  {
    title: 'Khám phá',
    links: [
      { label: 'Mua Prompt', to: '/Hire' },
      { label: 'Gói Prompt', to: '/packages' },
      { label: 'Bán Prompt', to: '/Sell' },
      { label: 'Kho Prompt của tôi', to: '/mystorage' }
    ]
  },
  {
    title: 'Dành cho giáo viên',
    links: [
      { label: 'Quản lý Template', to: '/my-templates' },
      { label: 'Quản lý Gói', to: '/my-packages' },
      { label: 'Prompt yêu thích', to: '/myfavorites' },
      { label: 'Ví cá nhân', to: '/wallet' }
    ]
  }
]

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Youtube, href: 'https://youtube.com', label: 'Youtube' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' }
]

const Footer: React.FC = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#050513] to-[#03030a] text-neutral-200">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-32 -left-20 h-72 w-72 rounded-full bg-indigo-500/30 blur-[120px]" />
        <div className="absolute bottom-[-120px] right-[-40px] h-80 w-80 rounded-full bg-sky-500/30 blur-[140px]" />
        <div className="absolute top-1/3 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-purple-500/20 blur-[160px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 pt-16 space-y-16">
        {/* Grid */}
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-5">
            <Link to="/" className="flex items-center gap-3">
              <img
                src={new URL('../../assets/Image/LogoEduPrompt.png', import.meta.url).href}
                alt="EduPrompt"
                className="h-10 w-10 rounded-lg border border-white/10 bg-white/5 p-1.5"
              />
              <div>
                <span className="text-xl font-semibold text-white tracking-wide">EduPrompt</span>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">AI for Educators</p>
              </div>
            </Link>
            <p className="text-neutral-300 leading-relaxed">
              Nền tảng giúp giáo viên tạo, chia sẻ và thương mại hóa các prompt AI chất lượng cao dành riêng cho giáo dục phổ
              thông.
            </p>
            <div className="space-y-3 text-sm text-neutral-300">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-sky-300" />
                <span>TP. Hồ Chí Minh, Việt Nam</span>
              </div>
              <a href="mailto:support@eduprompt.vn" className="flex items-center gap-3 hover:text-white transition-colors">
                <Mail className="h-4 w-4 text-sky-300" />
                <span>support@eduprompt.vn</span>
              </a>
              <a href="tel:+84888888888" className="flex items-center gap-3 hover:text-white transition-colors">
                <Phone className="h-4 w-4 text-sky-300" />
                <span>+84 888 888 888</span>
              </a>
            </div>
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition-all hover:scale-105 hover:border-white/30 hover:text-white"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((column) => (
            <div key={column.title} className="space-y-4">
              <h4 className="text-white font-semibold text-lg">{column.title}</h4>
              <ul className="space-y-3 text-sm text-neutral-300">
                {column.links.map((link) =>
                  link ? (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="inline-flex items-center gap-2 text-sm text-neutral-300 hover:text-white hover:translate-x-1 transition-all duration-200"
                      >
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  ) : null
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-400">
          <p>© {year} EduPrompt. Tất cả các quyền được bảo lưu.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/legal/privacy" className="hover:text-white transition-colors">
              Chính sách bảo mật
            </Link>
            <Link to="/legal/terms" className="hover:text-white transition-colors">
              Điều khoản sử dụng
            </Link>
            <Link to="/support/contact" className="hover:text-white transition-colors">
              Liên hệ hỗ trợ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer


