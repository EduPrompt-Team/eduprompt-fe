import React from 'react'
import AdminHeader from '@/components/Admin/AdminHeader'
import MyProfile from '@/components/ProfileUser/MyProfile'
import AdminProtectedRoute from '@/components/Admin/AdminProtectedRoute'

const AdminViewProfilePage: React.FC = () => {
  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <AdminHeader />
        <div className="flex">
          {/* No sidebar for admin profile to keep it focused */}
          <main className="flex-1 bg-[#23233a] text-white min-h-[calc(100vh-3.5rem)] px-0">
            <MyProfile />
          </main>
        </div>
      </div>
    </AdminProtectedRoute>
  )
}

export default AdminViewProfilePage


