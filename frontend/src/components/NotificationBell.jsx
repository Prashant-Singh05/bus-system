import React from 'react'
import api from '../api/client'

export default function NotificationBell() {
  const [open, setOpen] = React.useState(false)
  const [items, setItems] = React.useState([])
  const unread = items.filter(n => n.status === 'unread').length

  const fetchNotifs = async () => {
    try {
      const { data } = await api.get('/api/notifications')
      setItems(data || [])
    } catch {}
  }

  React.useEffect(() => {
    fetchNotifs()
    const t = setInterval(fetchNotifs, 15000)
    return () => clearInterval(t)
  }, [])

  const markAllRead = async () => {
    try {
      const userId = Number(localStorage.getItem('user_id')) || 0
      await api.put(`/api/notifications/mark-all-read/${userId}`)
      fetchNotifs()
    } catch {}
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)} className="relative p-2 rounded-lg hover:bg-gray-100">
        <span role="img" aria-label="bell">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 text-xs bg-red-600 text-white rounded-full px-1">{unread}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <div className="text-sm font-medium">Notifications</div>
            <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">Mark all as read</button>
          </div>
          <div className="max-h-80 overflow-auto">
            {items.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No notifications</div>
            ) : items.map(n => (
              <div key={n.id} className={`px-3 py-2 text-sm ${n.status === 'unread' ? 'bg-blue-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <span>{n.message}</span>
                  <span className="text-[11px] text-gray-500">{new Date(n.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


