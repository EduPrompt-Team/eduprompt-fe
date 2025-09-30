import React from 'react'
import { Link, NavLink } from 'react-router-dom'

const navItemClass = ({ isActive }: { isActive: boolean }) =>
  [
    'px-4 py-2 rounded-full text-sm transition-colors',
    isActive ? 'bg-[#3a3a5a] text-white' : 'text-neutral-300 hover:text-white',
  ].join(' ')

const Header: React.FC = () => {
  return (
    <header className="w-full bg-[#23233a] border-b border-[#2a2a44] shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.03)]">
      <div className="mx-auto max-w-7xl h-16 md:h-18 flex items-center px-5">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={new URL('../../assets/Image/LogoEduPrompt.png', import.meta.url).href}
            alt="EduPrompt"
            className="h-7 w-7 md:h-8 md:w-10 object-contain scale-in"
          />
          <span className="text-white text-lg md:text-xl font-bold tracking-wide slide-up anim-delay-100">EduPrompt</span>
        </Link>

        <nav className="hidden md:flex items-center gap-2 ml-auto slide-up anim-delay-200">
          <NavLink to="/Create" className={(props) => navItemClass(props) + ' tilt-hover'}>
            Tạo Prompt
          </NavLink>
          <NavLink to="/Hire" className={(props) => navItemClass(props) + ' tilt-hover'}>
           Mua Prompt 
          </NavLink>
          <NavLink to="/Sell" className={(props) => navItemClass(props) + ' tilt-hover'}>
            Bán Prompt
          </NavLink>
          <NavLink to="/Login" className={(props) => navItemClass(props) + ' tilt-hover'}>
            Đăng nhập
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Header

