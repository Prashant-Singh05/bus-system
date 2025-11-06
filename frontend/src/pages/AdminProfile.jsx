import React from 'react'
import Header from '../components/Header'

export default function AdminProfile() {
  const userName = localStorage.getItem('name') || 'Admin'
  const userEmail = localStorage.getItem('email') || 'admin@example.com'

  const onLogout = () => {
    localStorage.clear()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Header title="Admin Profile" subtitle="Manage your account" userName={userName} onLogout={onLogout} profilePath="/admin/profile" />
        <div className="bg-white shadow rounded-2xl p-6">
          <div className="grid gap-4">
            <div>
              <div className="text-sm text-gray-600">Name</div>
              <div className="text-lg font-semibold">{userName}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Email</div>
              <div className="text-lg font-semibold">{userEmail}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Role</div>
              <div className="text-lg font-semibold">Admin</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
