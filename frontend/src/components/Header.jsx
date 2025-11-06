import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Header({ userName, statusBadge, onLogout, title, subtitle, rightSlot, showProfileMenu }) {
  const navigate = useNavigate()
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      localStorage.clear()
      navigate('/login')
    }
  }

  return (
    <header className="bg-white shadow-md px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold">{title || `Welcome, ${userName}`}</h1>
            <p className="text-sm text-gray-600">{subtitle || `${currentDate} • ${currentTime}`}</p>
          </div>
          {statusBadge && (
            <div className="ml-4">
              {statusBadge}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {rightSlot}
          {showProfileMenu ? (
            <ProfileMenu onLogout={handleLogout} userName={userName} />
          ) : (
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

function ProfileMenu({ onLogout, userName }) {
  const [open, setOpen] = React.useState(false)
  const navigate = useNavigate()
  const goProfile = () => {
    const t = localStorage.getItem('type')
    if (t === 'hosteller' || t === 'hostel') navigate('/dashboard/hosteller/profile')
    else if (t === 'day_scholar') navigate('/dashboard/day-scholar/profile')
    else navigate('/admin')
    setOpen(false)
  }
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
          {userName?.[0]?.toUpperCase() || 'U'}
        </span>
        <span className="text-sm font-medium">Profile</span>
        <span>▾</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <button
            onClick={goProfile}
            className="w-full text-left px-4 py-2 hover:bg-gray-50"
          >
            View Profile
          </button>
          <div className="h-px bg-gray-100" />
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-2 hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}


