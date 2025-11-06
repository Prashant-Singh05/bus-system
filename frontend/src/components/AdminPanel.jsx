import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import api from '../api/client'
import MapView from './MapView'

export default function AdminPanel({ activeTab, onStatsUpdate }) {
  const [bookings, setBookings] = useState([])
  const [allBookings, setAllBookings] = useState([])
  const [users, setUsers] = useState([])
  const [buses, setBuses] = useState([])
  const [allocations, setAllocations] = useState([])
  const [live, setLive] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        if (activeTab === 'bookings') {
      const { data } = await api.get('/admin/bookings')
      setBookings(data)
          if (onStatsUpdate) {
            onStatsUpdate(prev => ({ ...prev, pendingBookings: data.length }))
          }
        } else if (activeTab === 'all-bookings') {
          const { data } = await api.get('/admin/bookings/all')
          setAllBookings(data)
        } else if (activeTab === 'users') {
          const { data } = await api.get('/admin/users')
          setUsers(data)
          if (onStatsUpdate) {
            onStatsUpdate(prev => ({ ...prev, totalUsers: data.length }))
          }
        } else if (activeTab === 'buses') {
          const { data } = await api.get('/admin/buses')
          setBuses(data)
          if (onStatsUpdate) {
            onStatsUpdate(prev => ({ ...prev, totalBuses: data.length }))
          }
        } else if (activeTab === 'allocations') {
          const { data } = await api.get('/admin/allocations')
          setAllocations(data)
          if (onStatsUpdate) {
            onStatsUpdate(prev => ({ ...prev, totalAllocations: data.length }))
          }
        }
      } catch (e) {
        console.error('Error fetching data:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [activeTab, onStatsUpdate])

  useEffect(() => {
    if (activeTab === 'map') {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000', { transports: ['websocket'] })
    socket.on('connected', () => {})
    socket.on('admin_live', (rows) => setLive(rows))

      const timer = setInterval(async () => {
      try { await api.get('/admin/live') } catch {}
    }, 5000)

    return () => { socket.close(); clearInterval(timer) }
    }
  }, [activeTab])

  const approve = async (id) => {
    try {
    await api.post(`/admin/approve/${id}`)
    setBookings(b => b.filter(x => x.booking_id !== id))
      if (onStatsUpdate) {
        onStatsUpdate(prev => ({ ...prev, pendingBookings: prev.pendingBookings - 1 }))
      }
    } catch (e) {
      console.error('Error approving booking:', e)
    }
  }

  const reject = async (id) => {
    try {
      await api.post(`/admin/reject/${id}`)
      setBookings(b => b.filter(x => x.booking_id !== id))
      if (onStatsUpdate) {
        onStatsUpdate(prev => ({ ...prev, pendingBookings: prev.pendingBookings - 1 }))
      }
    } catch (e) {
      console.error('Error rejecting booking:', e)
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      auto_assigned: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div>
      {/* Pending Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Pending Booking Requests</h3>
          {bookings.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-600">
              No pending booking requests
            </div>
          ) : (
            <div className="grid gap-4">
        {bookings.map(b => (
                <div key={b.booking_id} className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-lg">{b.name}</div>
                      <div className="text-sm text-gray-600">Student ID: {b.student_id}</div>
              <div className="text-sm text-gray-600">Bus ID: {b.bus_id}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => approve(b.booking_id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => reject(b.booking_id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Bookings Tab */}
      {activeTab === 'all-bookings' && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">All Bookings</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bus No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allBookings.map(b => (
                  <tr key={b.booking_id}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{b.student_name}</div>
                      <div className="text-sm text-gray-500">{b.email}</div>
                    </td>
                    <td className="px-4 py-3">{b.bus_no}</td>
                    <td className="px-4 py-3">{getStatusBadge(b.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(b.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">All Users</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map(u => (
                  <tr key={u.user_id}>
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{getStatusBadge(u.role)}</td>
                    <td className="px-4 py-3">{u.type ? getStatusBadge(u.type) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Buses Tab */}
      {activeTab === 'buses' && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">All Buses</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {buses.map(bus => (
              <div key={bus.bus_id} className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-lg">Bus {bus.bus_no}</div>
                  {getStatusBadge(bus.status)}
                </div>
                <div className="text-sm text-gray-600 mb-1">Route: {bus.route}</div>
                <div className="text-sm text-gray-600 mb-1">Capacity: {bus.capacity} seats</div>
                <div className="text-sm text-gray-600">Available Time: {bus.available_time || 'N/A'}</div>
          </div>
        ))}
      </div>
        </div>
      )}

      {/* Allocations Tab */}
      {activeTab === 'allocations' && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Student Bus Allocations</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bus No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allocated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allocations.map(a => (
                  <tr key={a.allocation_id}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{a.student_name}</div>
                      <div className="text-sm text-gray-500">{a.email}</div>
                    </td>
                    <td className="px-4 py-3">{a.type ? getStatusBadge(a.type) : '-'}</td>
                    <td className="px-4 py-3 font-medium">{a.bus_no}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.route}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Live Map Tab */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Live Bus Tracking</h3>
          <div className="bg-white border rounded-lg p-4">
        <MapView items={live} />
      </div>
        </div>
      )}
    </div>
  )
}
