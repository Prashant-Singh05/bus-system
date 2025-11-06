import React, { useEffect, useState } from 'react'
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom'
import Header from '../components/Header'
import TimeCard from '../components/TimeCard'
import BusStatusCard from '../components/BusStatusCard'
import LiveStatus from '../components/LiveStatus'
import RequestForm from '../components/RequestForm'
import api from '../api/client'
import BusDetails from './BusDetails'
import Card from '../components/ui/Card'
import NotificationCard from '../components/ui/NotificationCard'
import StatusBadge from '../components/ui/StatusBadge'
import { Link } from 'react-router-dom'

function HostellerDashboard() {
  const navigate = useNavigate()
  const [allocationStatus, setAllocationStatus] = useState('none')
  const [allocation, setAllocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [error, setError] = useState('')
  const [requestStats, setRequestStats] = useState({ pending: 0, approved: 0, rejected: 0 })
  const [recentRequests, setRecentRequests] = useState([])
  const [showRequest, setShowRequest] = useState(false)
  const [showLive, setShowLive] = useState(false)
  const [notifications, setNotifications] = useState([])
  const userName = localStorage.getItem('name') || 'Student'

  useEffect(() => {
    checkStatus()
    fetchNotifications()
    const t = setInterval(fetchNotifications, 15000)
    return () => clearInterval(t)
  }, [])

  const checkStatus = async () => {
    try {
      const { data } = await api.get('/bus/my')
      setAllocationStatus(data.status)
      if (data.status === 'allocated') {
        setAllocation(data.allocation)
        localStorage.setItem('allocationStatus', 'allocated')
      } else if (data.status === 'pending') {
        localStorage.setItem('allocationStatus', 'pending')
      } else {
        localStorage.setItem('allocationStatus', 'none')
      }

      // Fetch booking history for stats
      try {
        const bookingsRes = await api.get('/admin/bookings/all')
        const userEmail = localStorage.getItem('email')
        const myBookings = bookingsRes.data.filter(b => b.email === userEmail)
        
        const stats = { pending: 0, approved: 0, rejected: 0 }
        myBookings.forEach(b => {
          if (b.status === 'pending') stats.pending++
          else if (b.status === 'approved') stats.approved++
          else if (b.status === 'rejected') stats.rejected++
        })
        setRequestStats(stats)
        setRecentRequests(myBookings.slice(0, 3))
      } catch (e) {
        console.error('Error fetching bookings:', e)
      }
    } catch (e) {
      console.error('Error checking status:', e)
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

  const handleRequestSuccess = () => {
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
      checkStatus()
    }, 3000)
  }

  const handleRequestError = (errorMsg) => {
    setError(errorMsg)
    setTimeout(() => setError(''), 5000)
  }

  const getStatusBadge = () => {
    switch (allocationStatus) {
      case 'pending':
        return (
          <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            ⏳ Pending Approval
          </span>
        )
      case 'allocated':
        return (
          <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            ✅ Request Approved
          </span>
        )
      case 'rejected':
        return (
          <span className="px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            ❌ Request Rejected
          </span>
        )
      default:
        return null
    }
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
      <Header 
        userName={userName} 
        statusBadge={getStatusBadge()}
        onLogout={handleLogout} 
        title="Hosteller Dashboard"
        showProfileMenu
      />
      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="md:col-span-2 space-y-6">
          {/* Toast Notification */}
          {showToast && (
            <div className="fixed top-20 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
              Your booking request has been sent for approval.
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

            {/* Need a Bus? collapsible */}
            <Card>
              <h2 className="text-2xl font-bold mb-2 text-green-700">Need a Bus? 🚌</h2>
              <p className="text-gray-600 mb-3">Request a bus for your travel needs</p>
              <button
                onClick={() => setShowRequest(v => !v)}
                className="mb-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                {showRequest ? 'Hide Request Form' : 'Request Bus'}
              </button>
              {showRequest && (
                <div className="mt-3">
                  <RequestForm 
                    onSuccess={handleRequestSuccess}
                    onError={handleRequestError}
                    onCancel={() => setShowRequest(false)}
                  />
                </div>
              )}
            </Card>

          {/* Pending Status */}
          {allocationStatus === 'pending' && (
            <div className="bg-white shadow rounded-2xl p-6 border-l-4 border-yellow-500">
              <h2 className="text-xl font-semibold mb-2">📋 Request Status: Pending</h2>
              <p className="text-gray-600">Your booking request is being reviewed by the admin.</p>
              <p className="text-gray-600 mt-2">Bus No: Not Assigned</p>
            </div>
          )}

            {/* Approved Status */}
            {allocationStatus === 'allocated' && allocation && (
              <>
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-green-700">✅ Request Approved</h2>
                  <BusStatusCard busData={allocation} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-green-700">Live Tracking</h2>
                  <p className="text-gray-600 mb-3">Train-like progress tracker (no map)</p>
                  <button
                    onClick={() => setShowLive(v => !v)}
                    className="mb-3 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition"
                  >
                    {showLive ? 'Hide Live Tracking' : 'Open Live Tracking'}
                  </button>
                  {showLive && (
                    <LiveStatus busId={allocation.bus_id} route={allocation.route} />
                  )}
                </div>
              </>
            )}

          {/* Rejected Status */}
          {allocationStatus === 'rejected' && (
            <div className="bg-white shadow rounded-2xl p-6 border-l-4 border-red-500">
              <h2 className="text-xl font-semibold mb-2">❌ Your request was rejected by Admin.</h2>
              <p className="text-gray-600 mb-4">Reason: Bus capacity full.</p>
              <p className="text-gray-600">Try a different time or route.</p>
              <button
                onClick={() => navigate('/dashboard/hosteller/request')}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                Submit New Request
              </button>
            </div>
          )}

            {/* My Booking (latest) */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-green-700">My Booking</h2>
              {recentRequests.length > 0 ? (
                <Card>
                  {(() => { const req = recentRequests[0] || {}; return (
                    <>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm text-gray-500">Booking ID</div>
                          <div className="font-semibold">{req.booking_id || 'N/A'}</div>
                        </div>
                        <StatusBadge status={req.status} />
                      </div>
                      <div className="mt-2 text-sm text-gray-700">Bus {req.bus_no || 'N/A'}</div>
                      {req.reason && <div className="text-sm text-gray-500">{req.reason}</div>}
                      {req.date && <div className="text-sm text-gray-500">{req.date}</div>}
                    </>
                  ) })()}
                </Card>
              ) : (
                <Card>
                  <div className="text-gray-600 text-sm">No booking found yet.</div>
                </Card>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {allocationStatus === 'allocated' && allocation && (
              <Card>
                <h3 className="text-lg font-semibold mb-4">Driver Information</h3>
                <div className="space-y-2 text-gray-700">
                  <div><span className="text-gray-500">Name:</span> <span className="font-medium">{allocation?.driver_name || 'N/A'}</span></div>
                  <div><span className="text-gray-500">Contact:</span> <span className="font-medium">{allocation?.driver_contact || 'N/A'}</span></div>
                </div>
              </Card>
            )}
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
              <h3 className="text-lg font-semibold mb-2">Tools</h3>
              <Link to="/availability" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">Open Bus Availability Checker</Link>
            </Card>
          </div>
        </div>

      </main>
    </div>
  )
}

function RequestPage() {
  const navigate = useNavigate()
  const [showToast, setShowToast] = useState(false)
  const [error, setError] = useState('')
  const userName = localStorage.getItem('name') || 'Student'

  const handleRequestSuccess = () => {
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
      navigate('/dashboard/hosteller/status')
    }, 2000)
  }

  const handleRequestError = (errorMsg) => {
    setError(errorMsg)
    setTimeout(() => setError(''), 5000)
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userType="hosteller" />
      <div className="flex-1 ml-60">
        <Header userName={userName} onLogout={handleLogout} />
        <main className="p-6">
          {showToast && (
            <div className="fixed top-20 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
              Your booking request has been sent for approval.
            </div>
          )}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          <h2 className="text-2xl font-bold mb-4 text-green-700">Request Bus Booking</h2>
          <RequestForm 
            onSuccess={handleRequestSuccess}
            onError={handleRequestError}
          />
        </main>
      </div>
    </div>
  )
}

function StatusPage() {
  const navigate = useNavigate()
  const [allocationStatus, setAllocationStatus] = useState('none')
  const [allocation, setAllocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const userName = localStorage.getItem('name') || 'Student'

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    try {
      const { data } = await api.get('/bus/my')
      setAllocationStatus(data.status)
      if (data.status === 'allocated') {
        setAllocation(data.allocation)
        localStorage.setItem('allocationStatus', 'allocated')
      } else if (data.status === 'pending') {
        localStorage.setItem('allocationStatus', 'pending')
      } else {
        localStorage.setItem('allocationStatus', 'none')
      }
    } catch (e) {
      console.error('Error checking status:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const getStatusBadge = () => {
    switch (allocationStatus) {
      case 'pending':
        return (
          <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            ⏳ Pending Approval
          </span>
        )
      case 'allocated':
        return (
          <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            ✅ Request Approved
          </span>
        )
      case 'rejected':
        return (
          <span className="px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            ❌ Request Rejected
          </span>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar userType="hosteller" />
        <div className="flex-1 ml-60 p-6">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userType="hosteller" />
      <div className="flex-1 ml-60">
        <Header 
          userName={userName} 
          statusBadge={getStatusBadge()}
          onLogout={handleLogout} 
        />
        <main className="p-6 space-y-6">
          {allocationStatus === 'none' && (
            <div className="bg-white shadow rounded-2xl p-6 border-l-4 border-gray-400">
              <h2 className="text-xl font-semibold mb-2">No Booking Request</h2>
              <p className="text-gray-600 mb-4">You haven't submitted a booking request yet.</p>
              <button
                onClick={() => navigate('/dashboard/hosteller/request')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                Submit Request
              </button>
            </div>
          )}

          {allocationStatus === 'pending' && (
            <div className="bg-white shadow rounded-2xl p-6 border-l-4 border-yellow-500">
              <h2 className="text-xl font-semibold mb-2">📋 Request Status: Pending</h2>
              <p className="text-gray-600">Your booking request is being reviewed by the admin.</p>
              <p className="text-gray-600 mt-2">Bus No: Not Assigned</p>
              <p className="text-gray-500 text-sm mt-4">We'll notify you once your request is reviewed.</p>
            </div>
          )}

          {allocationStatus === 'allocated' && allocation && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-green-700">✅ Request Approved</h2>
              <BusStatusCard busData={allocation} />
            </div>
          )}

          {allocationStatus === 'rejected' && (
            <div className="bg-white shadow rounded-2xl p-6 border-l-4 border-red-500">
              <h2 className="text-xl font-semibold mb-2">❌ Your request was rejected by Admin.</h2>
              <p className="text-gray-600 mb-4">Reason: Bus capacity full.</p>
              <p className="text-gray-600 mb-4">Try a different time or route.</p>
              <button
                onClick={() => navigate('/dashboard/hosteller/request')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
              >
                Submit New Request
              </button>
            </div>
          )}
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
        <Sidebar userType="hosteller" />
        <div className="flex-1 ml-60 p-6">
          <div className="text-center py-12">Loading...</div>
        </div>
      </div>
    )
  }

  if (!allocation) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar userType="hosteller" />
        <div className="flex-1 ml-60">
          <Header userName={userName} onLogout={handleLogout} />
          <main className="p-6">
            <div className="bg-white shadow rounded-2xl p-6 border-l-4 border-yellow-500">
              <h2 className="text-xl font-semibold mb-2">No Bus Assigned</h2>
              <p className="text-gray-600">Your booking request needs to be approved first.</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userType="hosteller" />
      <div className="flex-1 ml-60">
        <Header userName={userName} onLogout={handleLogout} />
        <main className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4 text-green-700">Live Bus Tracking</h2>
            <BusStatusCard busData={allocation} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4 text-green-700">Live Route Status</h2>
            <LiveStatus busId={allocation.bus_id} route={allocation.route} />
          </div>
        </main>
      </div>
    </div>
  )
}

function ProfilePage() {
  const navigate = useNavigate()
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [editing, setEditing] = React.useState(false)
  const [form, setForm] = React.useState({})

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  React.useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/auth/me')
        setData(res.data)
        setForm({
          name: res.data.name || '',
          contact_no: res.data.contact_no || '',
          address: res.data.address || '',
          emergency_name: res.data.emergency_name || '',
          emergency_phone: res.data.emergency_phone || '',
          hostel_block: res.data.hostel_block || '',
          room_no: res.data.room_no || ''
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
  const userType = (data.type === 'hostel' ? 'hosteller' : data.type) || 'hosteller'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <button onClick={() => navigate('/dashboard/hosteller')} className="text-sm flex items-center gap-2 opacity-90 hover:opacity-100">
            <span>←</span> Back to Dashboard
          </button>
          <div className="mt-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl">👤</div>
            <div>
              <div className="text-2xl font-semibold">{userName}</div>
              <div className="mt-1 inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-sm">
                {userType === 'hosteller' ? 'Hosteller' : 'Student'}
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

            {/* Emergency Contact */}
            <section>
              <h3 className="font-semibold mb-3">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Contact Name</label>
                  <input name="emergency_name" className="w-full rounded-lg border-gray-200" disabled={!editing} value={form.emergency_name} onChange={onChange} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Contact Number</label>
                  <input name="emergency_phone" className="w-full rounded-lg border-gray-200" disabled={!editing} value={form.emergency_phone} onChange={onChange} />
                </div>
              </div>
            </section>

            {/* Hostel Information */}
            <section>
              <h3 className="font-semibold mb-3">Hostel Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Hostel Block</label>
                  <input name="hostel_block" className="w-full rounded-lg border-gray-200" disabled={!editing} value={form.hostel_block} onChange={onChange} />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Room Number</label>
                  <input name="room_no" className="w-full rounded-lg border-gray-200" disabled={!editing} value={form.room_no} onChange={onChange} />
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

export default function DashboardHosteller() {
  return (
    <Routes>
      <Route index element={<HostellerDashboard />} />
      <Route path="request" element={<RequestPage />} />
      <Route path="status" element={<StatusPage />} />
      <Route path="live" element={<LiveStatusPage />} />
      <Route path="profile" element={<ProfilePage />} />
      <Route path="bus-details" element={<BusDetails />} />
      <Route path="*" element={<Navigate to="/dashboard/hosteller" replace />} />
    </Routes>
  )
}
