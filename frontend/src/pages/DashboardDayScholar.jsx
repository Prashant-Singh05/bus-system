import React, { useEffect, useState } from 'react'
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom'
import Header from '../components/Header'
import TimeCard from '../components/TimeCard'
import BusStatusCard from '../components/BusStatusCard'
import LiveStatus from '../components/LiveStatus'
import Card from '../components/ui/Card'
import StatusBadge from '../components/ui/StatusBadge'
import Timeline from '../components/ui/Timeline'
import NotificationCard from '../components/ui/NotificationCard'
import api from '../api/client'
import { Link } from 'react-router-dom'

function DayScholarDashboard() {
  const navigate = useNavigate()
  const [allocation, setAllocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [availability, setAvailability] = useState([])
  const [selectedTime, setSelectedTime] = useState('')
  const [notifications, setNotifications] = useState([])
  const userName = localStorage.getItem('name') || 'Student'

  useEffect(() => {
    fetchAllocation()
    fetchAvailability()
    fetchNotifications()
    const t = setInterval(fetchNotifications, 15000)
    return () => clearInterval(t)
  }, [])

  const fetchAllocation = async () => {
    try {
      const { data } = await api.get('/bus/my')
      if (data.status === 'allocated') {
        setAllocation(data.allocation)
        localStorage.setItem('allocationStatus', 'allocated')
      }
    } catch (e) {
      console.error('Error fetching allocation:', e)
    } finally {
      setLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/api/notifications')
      setNotifications(data || [])
    } catch (e) {
      // ignore
    }
  }

  const fetchAvailability = async () => {
    try {
      const { data } = await api.get('/bus/list')
      setAvailability(data || [])
    } catch (e) {
      console.error('Error fetching availability:', e)
    }
  }

  const checkAvailabilityForTime = () => {
    if (!selectedTime) return []
    return availability.filter(bus => {
      const busTime = (bus.start_time || bus.available_time)?.substring(0, 5)
      return busTime === selectedTime
    })
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div>
        <Header userName={userName} onLogout={handleLogout} title="Day Scholar Dashboard" showProfileMenu />
        <main className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column: Assigned bus + Live tracking */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4 text-blue-700">Your Assigned Bus</h2>
                <Card>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Bus Number</div>
                      <div className="text-lg font-semibold">{allocation?.bus_no || 'N/A'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-500">Status</div>
                      <StatusBadge status={allocation?.bus_status || 'On Time'} />
                    </div>
                    <div className="md:col-span-2">
                      <div className="text-sm text-gray-500">Route</div>
                      <div className="font-medium">{allocation?.route || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Current Stop</div>
                      <div className="font-medium">{allocation?.current_stop || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Next Stop</div>
                      <div className="font-medium">{allocation?.next_stop || 'N/A'}</div>
                    </div>
                  </div>
                </Card>
              </div>
              {allocation && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-blue-700">Live Bus Tracking</h2>
                  <LiveStatus busId={allocation.bus_id} route={allocation.route} />
                </div>
              )}
            </div>

            {/* Right column: Driver info -> Notifications -> Tools */}
            <div className="space-y-6">
              {/* Driver information */}
              <Card>
                <h3 className="text-lg font-semibold mb-4">Driver Information</h3>
                <div className="space-y-2 text-gray-700">
                  <div><span className="text-gray-500">Name:</span> <span className="font-medium">{allocation?.driver_name || 'N/A'}</span></div>
                  <div><span className="text-gray-500">Contact:</span> <span className="font-medium">N/A</span></div>
                </div>
              </Card>

              {/* Notifications – fed from backend */}
              <Card>
                <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <div className="text-sm text-gray-500">No notifications</div>
                  ) : notifications.slice(0,3).map(n => (
                    <NotificationCard key={n.id} type={n.type || 'info'} unread={n.status === 'unread'}>
                      {n.message}
                    </NotificationCard>
                  ))}
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">Tools</h3>
                </div>
                <Link to="/availability" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">Open Bus Availability Checker</Link>
              </Card>
            </div>
          </div>

          {/* Removed bottom availability section per request */}
        </main>
      </div>
    </div>
  )
}

function LiveStatusPage() {
  const navigate = useNavigate()
  const [allocation, setAllocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const userName = localStorage.getItem('name') || 'Student'

  useEffect(() => {
    fetchAllocation()
  }, [])

  const fetchAllocation = async () => {
    try {
      const { data } = await api.get('/bus/my')
      if (data.status === 'allocated') {
        setAllocation(data.allocation)
      }
    } catch (e) {
      console.error('Error fetching allocation:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar userType="day_scholar" />
        <div className="flex-1 ml-60 p-6">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    )
  }

  if (!allocation) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar userType="day_scholar" />
        <div className="flex-1 ml-60">
          <Header userName={userName} onLogout={handleLogout} />
          <main className="p-6">
            <div className="bg-white shadow rounded-2xl p-6 border-l-4 border-blue-500">
              <h2 className="text-xl font-semibold mb-2">No Bus Assigned</h2>
              <p className="text-gray-600">Please contact admin to assign a bus.</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userType="day_scholar" />
      <div className="flex-1 ml-60">
        <Header userName={userName} onLogout={handleLogout} />
        <main className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-blue-700">🕒 Bus Live Status</h2>
            <BusStatusCard busData={allocation} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4 text-blue-700">Live Route Status</h2>
            <LiveStatus busId={allocation.bus_id} route={allocation.route} />
          </div>
        </main>
      </div>
    </div>
  )
}

function SchedulePage() {
  const navigate = useNavigate()
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const userName = localStorage.getItem('name') || 'Student'

  useEffect(() => {
    fetchBuses()
  }, [])

  const fetchBuses = async () => {
    try {
      const { data } = await api.get('/bus/list')
      setBuses(data || [])
    } catch (e) {
      console.error('Error fetching buses:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar userType="day_scholar" />
        <div className="flex-1 ml-60 p-6">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userType="day_scholar" />
      <div className="flex-1 ml-60">
        <Header userName={userName} onLogout={handleLogout} />
        <main className="p-6">
          <div className="bg-white shadow rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-700">📅 Bus Schedule</h2>
            <div className="grid gap-4">
              {buses.map(bus => (
                <div key={bus.bus_id} className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-lg">
                  <div className="font-bold text-lg">Bus {bus.bus_no}</div>
                  <div className="text-gray-700 mt-1">Route: {bus.route}</div>
                  <div className="text-gray-700 mt-1">
                    Available Time: {bus.available_time || 'N/A'}
                  </div>
                  <div className="text-gray-700 mt-1">Capacity: {bus.capacity} seats</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function RouteMapPage() {
  const navigate = useNavigate()
  const [allocation, setAllocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const userName = localStorage.getItem('name') || 'Student'

  useEffect(() => {
    fetchAllocation()
  }, [])

  const fetchAllocation = async () => {
    try {
      const { data } = await api.get('/bus/my')
      if (data.status === 'allocated') {
        setAllocation(data.allocation)
      }
    } catch (e) {
      console.error('Error fetching allocation:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar userType="day_scholar" />
        <div className="flex-1 ml-60 p-6">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userType="day_scholar" />
      <div className="flex-1 ml-60">
        <Header userName={userName} onLogout={handleLogout} />
        <main className="p-6">
          <div className="bg-white shadow rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-700">📍 Route Map</h2>
            {allocation ? (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Bus {allocation.bus_no}</h3>
                  <p className="text-gray-700">{allocation.route}</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4 space-y-2">
                  {allocation.route.split(/[-→→]/).map((stop, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-blue-600 font-bold">{index + 1}.</span>
                      <span className="text-gray-700">{stop.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No bus assigned</p>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function ProfilePage() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/auth/me')
        setData(res.data)
        setForm({
          name: res.data.name || '',
          contact_no: res.data.contact_no || '',
          address: res.data.address || ''
        })
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSave = async () => {
    try {
      const res = await api.put('/auth/me', form)
      setData(res.data)
      setEditing(false)
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to save')
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!data) return null

  const userName = data.name || localStorage.getItem('name') || 'Student'
  const userEmail = data.email || localStorage.getItem('email') || ''
  const userType = data.type || 'day_scholar'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <button onClick={() => navigate('/dashboard/day-scholar')} className="text-sm flex items-center gap-2 opacity-90 hover:opacity-100">
            <span>←</span> Back to Dashboard
          </button>
          <div className="mt-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl">👤</div>
            <div>
              <div className="text-2xl font-semibold">{userName}</div>
              <div className="mt-1 inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-sm">
                {userType === 'day_scholar' ? 'Day Scholar' : 'Student'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 mt-8 pb-10">
        <div className="bg-white rounded-2xl shadow p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Profile Information</h2>
            <button onClick={() => (editing ? onSave() : setEditing(true))} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">{editing ? 'Save Changes' : 'Edit Profile'}</button>
          </div>

          <div className="space-y-8">
            {/* Basic Information */}
            <section>
              <h3 className="font-semibold mb-3">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Full Name</label>
                  <input name="name" className="w-full rounded-lg border-gray-200" disabled={!editing} value={form.name} onChange={onChange} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email Address</label>
                  <input className="w-full rounded-lg border-gray-200 bg-gray-50" disabled value={userEmail} />
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                  <input name="contact_no" className="w-full rounded-lg border-gray-200" disabled={!editing} value={form.contact_no} onChange={onChange} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Address</label>
                  <input name="address" className="w-full rounded-lg border-gray-200" disabled={!editing} value={form.address} onChange={onChange} />
                </div>
              </div>
            </section>

            {/* Security */}
            <section>
              <h3 className="font-semibold mb-3">Security</h3>
              <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">Change Password</button>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DashboardDayScholar() {
  return (
    <Routes>
      <Route index element={<DayScholarDashboard />} />
      <Route path="live" element={<LiveStatusPage />} />
      <Route path="schedule" element={<SchedulePage />} />
      <Route path="route" element={<RouteMapPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/dashboard/day-scholar" replace />} />
    </Routes>
  )
}
