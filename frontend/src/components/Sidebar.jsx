import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Sidebar({ userType }) {
  const location = useLocation()
  
  const isActive = (path) => {
    if (path === '/dashboard/day-scholar' || path === '/dashboard/hosteller') {
      return location.pathname === path || location.pathname.startsWith(path + '/')
    }
    return location.pathname === path || location.pathname.startsWith(path)
  }

  const dayScholarMenu = [
    { path: '/dashboard/day-scholar', icon: '🏠', label: 'Dashboard' },
    { path: '/dashboard/day-scholar/live', icon: '🕒', label: 'Bus Live Status' },
    { path: '/dashboard/day-scholar/schedule', icon: '📅', label: 'Bus Schedule' },
    { path: '/dashboard/day-scholar/route', icon: '📍', label: 'Route Map' },
    { path: '/dashboard/day-scholar/profile', icon: '⚙️', label: 'Profile' }
  ]

  const hostellerMenu = [
    { path: '/dashboard/hosteller', icon: '🏠', label: 'Dashboard' },
    { path: '/dashboard/hosteller/request', icon: '📝', label: 'Request Bus' },
    { path: '/dashboard/hosteller/status', icon: '⏱️', label: 'Request Status' },
  ]

  // Add live status if approved - check allocation status from localStorage
  const allocationStatus = localStorage.getItem('allocationStatus')
  if (allocationStatus === 'allocated' && userType === 'hosteller') {
    hostellerMenu.push({ path: '/dashboard/hosteller/live', icon: '🚍', label: 'Live Bus Status' })
  }
  hostellerMenu.push({ path: '/dashboard/hosteller/profile', icon: '⚙️', label: 'Profile' })

  const menuItems = userType === 'day_scholar' ? dayScholarMenu : hostellerMenu

  return (
    <aside className="w-60 bg-gray-800 text-white fixed h-screen left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-8">Bus System</h2>
        <nav className="space-y-2">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive(item.path)
                  ? userType === 'day_scholar' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-green-600 text-white'
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}

