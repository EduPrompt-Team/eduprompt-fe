import React from 'react'

type UserProfile = {
  full_name: string
  email: string
  phone: string
  profile_url: string
  created_date: string
  updated_date: string
}

const MyProfile: React.FC = () => {
  const [profile] = React.useState<UserProfile>({
    full_name: 'Nguyễn Bắc Hùng',
    email: 'Hung@gmail.com',
    phone: '+84 912 345 678',
    profile_url: new URL('../../assets/Image/FuckBoy.jpg', import.meta.url).href,
    created_date: '2025-09-01 10:15',
    updated_date: '2025-09-29 18:42',
  })

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
              style={{ backgroundImage: `url(${profile.profile_url})` }}
            />
            <div className="mt-4 text-center">
              <div className="text-lg font-semibold">{profile.full_name}</div>
              <div className="text-sm text-neutral-400">{profile.email}</div>
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
                  {profile.full_name}
                </div>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Email</label>
                <div className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm break-all">
                  {profile.email}
                </div>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Số điện thoại</label>
                <div className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm">
                  {profile.phone}
                </div>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1"> Link ảnh đại diện</label>
                <div className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm break-all">
                  {profile.profile_url}
                </div>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Ngày tạo</label>
                <div className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm">
                  {profile.created_date}
                </div>
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">Cập nhật gần nhất</label>
                <div className="w-full rounded-lg bg-[#23233a] border border-[#2a2a44] px-3 py-2 text-sm">
                  {profile.updated_date}
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


