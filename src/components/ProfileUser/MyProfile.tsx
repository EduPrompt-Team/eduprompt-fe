import React from 'react'
import { fetchCurrentUser, getCurrentUser } from '@/lib/api'

type UserProfile = {
  fullName: string
  email: string
  phone?: string
  profileUrl?: string
  createdDate?: string
  updatedDate?: string
}

const MyProfile: React.FC = () => {
  const [profile, setProfile] = React.useState<UserProfile | null>(() => {
    const cached = getCurrentUser();
    if (!cached) return null;
    return {
      fullName: cached.fullName ?? cached.full_name ?? '',
      email: cached.email ?? '',
      phone: cached.phone ?? '',
      profileUrl: cached.profileUrl ?? cached.profile_url ?? '',
      createdDate: cached.createdDate ?? cached.created_date ?? '',
      updatedDate: cached.updatedDate ?? cached.updated_date ?? '',
    } as UserProfile;
  })

  React.useEffect(() => {
    fetchCurrentUser()
      .then((u) => setProfile({
        fullName: u.fullName ?? u.full_name ?? '',
        email: u.email ?? '',
        phone: u.phone ?? '',
        profileUrl: u.profileUrl ?? u.profile_url ?? '',
        createdDate: u.createdDate ?? u.created_date ?? '',
        updatedDate: u.updatedDate ?? u.updated_date ?? '',
      }))
      .catch(() => {/* ignore, user may not be logged in */})
  }, [])

  return (
    <main className="flex-1 text-white">
      {/* Header section with full-width line */}
      <div className="px-10 pt-6 md:pt-10">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold">Thông tin cá nhân</h1>
          <p className="text-neutral-400 mt-1">Thông tin hồ sơ của bạn</p>
        </div>
        <div className="mt-4 h-0.5 -mx-10 bg-white"></div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto p-6 md:p-10 pt-6">
        <div className="grid grid-cols-1 gap-6 ">
          {/* Up: Avatar */}
          <div className="relative rounded-2xl p-[2px] overflow-hidden max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-[conic-gradient(at_50%_50%,#ff3d3d_0%,#ffbf00_20%,#00ff80_40%,#00c3ff_60%,#8a2be2_80%,#ff3d3d_100%)] opacity-80 animate-pulse"></div>
            <div className="relative z-10 rounded-[14px] border border-[#2f2f4a] bg-[#1a1a2d] p-6 flex flex-col items-center">
            <div
              className="h-32 w-32 rounded-full bg-cover bg-center border border-[#3a3a5a]"
              style={{ backgroundImage: `url(${profile?.profileUrl || new URL('../../assets/Image/LogoEduPrompt.png', import.meta.url).href})` }}
            />
            <div className="mt-4 text-center">
              <div className="text-lg font-semibold">{profile?.fullName || '—'}</div>
              <div className="text-sm text-neutral-400">{profile?.email || '—'}</div>
            </div>
            </div>
          </div>

          {/* Down: Details */}
          <div className="relative rounded-2xl p-[2px] overflow-hidden">
            <div className="absolute inset-0 bg-[conic-gradient(at_50%_50%,#ff3d3d_0%,#ffbf00_20%,#00ff80_40%,#00c3ff_60%,#8a2be2_80%,#ff3d3d_100%)] opacity-80 animate-pulse"></div>
            <div className="relative z-10 rounded-[14px] border border-[#2f2f4a] bg-[#1a1a2d] p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Họ và tên</label>
                <div className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm">
                  {profile?.fullName || '—'}
                </div>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Email</label>
                <div className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm break-all">
                  {profile?.email || '—'}
                </div>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Số điện thoại</label>
                <div className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm">
                  {profile?.phone || '—'}
                </div>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1"> Link ảnh đại diện</label>
                <div className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm break-all">
                  {profile?.profileUrl || '—'}
                </div>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Ngày tạo</label>
                <div className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm">
                  {profile?.createdDate || '—'}
                </div>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Cập nhật gần nhất</label>
                <div className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm">
                  {profile?.updatedDate || '—'}
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default MyProfile


