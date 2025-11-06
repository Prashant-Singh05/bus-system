import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminPanel from '../components/AdminPanel'
import api from '../api/client'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('bookings')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBuses: 0,
    pendingBookings: 0,
    totalAllocations: 0
  })

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, buses, bookings] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/buses'),
          api.get('/admin/bookings')
        ])
        setStats({
          totalUsers: users.data.length,
          totalBuses: buses.data.length,
          pendingBookings: bookings.data.length,
          totalAllocations: 0 // Will fetch separately if needed
        })
      } catch (e) {
        console.error('Error fetching stats:', e)
      }
    }
    fetchStats()
  }, [])

  const tabs = [
    { id: 'bookings', label: 'Pending Bookings' },
    { id: 'all-bookings', label: 'All Bookings' },
    { id: 'users', label: 'Users' },
    { id: 'buses', label: 'Buses' },
    { id: 'allocations', label: 'Allocations' },
    { id: 'map', label: 'Live Map' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="bg-white shadow-md px-6 py-4 rounded-lg flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-2xl">🚌</div>
            <div>
              <h2 className="text-2xl font-bold">Admin Dashboard</h2>
              <p className="text-sm text-gray-600">Bus Management System Control Center</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            ⎋ Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-gray-600">Total Users</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-gray-600">Total Buses</div>
          <div className="text-2xl font-bold text-green-600">{stats.totalBuses}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="text-sm text-gray-600">Pending Bookings</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-sm text-gray-600">Allocations</div>
          <div className="text-2xl font-bold text-purple-600">{stats.totalAllocations}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

        {/* Tab Content */}
        <AdminPanel activeTab={activeTab} onStatsUpdate={setStats} />
      </div>
    </div>
  )
}
