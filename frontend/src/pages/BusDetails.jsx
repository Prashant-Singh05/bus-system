import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import api from '../api/client'

export default function BusDetails() {
  const navigate = useNavigate()
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ route: '', time: '' })
  const [myApprovedBus, setMyApprovedBus] = useState(null)
  const userName = localStorage.getItem('name') || 'Student'

  useEffect(() => {
    fetchBuses()
    fetchMyBus()
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

  const fetchMyBus = async () => {
    try {
      const { data } = await api.get('/bus/my')
      if (data.status === 'allocated') {
        setMyApprovedBus(data.allocation)
      }
    } catch (e) {
      console.error('Error fetching my bus:', e)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'on_time':
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'delayed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'full':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const filteredBuses = buses.filter(bus => {
    if (filter.route && !bus.route_name?.toLowerCase().includes(filter.route.toLowerCase())) return false
    if (filter.time && bus.start_time?.substring(0, 5) !== filter.time) return false
    return true
  })

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userType="hosteller" />
      <div className="flex-1 ml-60">
        <Header userName={userName} onLogout={handleLogout} />
        <main className="p-6 space-y-6">
          {/* My Approved Bus Card */}
          {myApprovedBus && (
            <div className="bg-white shadow rounded-2xl p-6 border-l-4 border-green-500">
              <h2 className="text-xl font-semibold mb-4 text-green-700">✅ My Approved Bus</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Bus No</div>
                  <div className="text-lg font-bold">{myApprovedBus.bus_no}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Route</div>
                  <div className="text-lg font-bold">{myApprovedBus.route}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Departure</div>
                  <div className="text-lg font-bold">{myApprovedBus.available_time || myApprovedBus.start_time}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div className="text-lg font-bold text-green-600">✅ Confirmed</div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white shadow rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">🔍 Filter Buses</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Route</label>
                <input
                  type="text"
                  placeholder="Filter by route..."
                  value={filter.route}
                  onChange={e => setFilter({ ...filter, route: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Time</label>
                <select
                  value={filter.time}
                  onChange={e => setFilter({ ...filter, time: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                >
                  <option value="">All Times</option>
                  <option value="08:00">08:00 AM</option>
                  <option value="08:15">08:15 AM</option>
                  <option value="08:30">08:30 AM</option>
                  <option value="08:45">08:45 AM</option>
                  <option value="09:00">09:00 AM</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilter({ route: '', time: '' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Bus Schedule Table */}
          <div className="bg-white shadow rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">🚌 Bus Schedule</h2>
            
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Bus No</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Route</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Departure</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Arrival</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Driver</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Availability</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBuses.map(bus => (
                    <tr key={bus.bus_id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-3 px-4 font-medium">{bus.bus_no}</td>
                      <td className="py-3 px-4">{bus.route_name || bus.route}</td>
                      <td className="py-3 px-4">{bus.start_time || 'N/A'}</td>
                      <td className="py-3 px-4">{bus.end_time || 'N/A'}</td>
                      <td className="py-3 px-4">{bus.driver_name || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(bus.status)}`}>
                          {bus.status === 'on_time' ? '🟢 Active' : bus.status === 'delayed' ? '🟡 Delayed' : bus.status || '🔵 Scheduled'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {bus.status !== 'full' && bus.status !== 'cancelled' ? (
                          <span className="text-green-600">✅ Available</span>
                        ) : (
                          <span className="text-red-600">❌ Not Available</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {filteredBuses.map(bus => (
                <div key={bus.bus_id} className="border-l-4 border-green-500 bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-lg">Bus {bus.bus_no}</div>
                      <div className="text-sm text-gray-600">{bus.route_name || bus.route}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(bus.status)}`}>
                      {bus.status === 'on_time' ? '🟢 Active' : bus.status || '🔵 Scheduled'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-600">Departure</div>
                      <div>{bus.start_time || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Arrival</div>
                      <div>{bus.end_time || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Driver</div>
                      <div>{bus.driver_name || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Availability</div>
                      <div>
                        {bus.status !== 'full' ? (
                          <span className="text-green-600">✅ Available</span>
                        ) : (
                          <span className="text-red-600">❌ Full</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredBuses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No buses found matching your filters
              </div>
            )}
          </div>

          {/* Route Preview */}
          {myApprovedBus && (
            <div className="bg-white shadow rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4">📍 Route Preview</h2>
              <div className="border-l-4 border-green-500 pl-4 space-y-2">
                {myApprovedBus.route?.split(/[-→→]/).map((stop, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-green-600 font-bold">{index + 1}.</span>
                    <span className="text-gray-700">{stop.trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={fetchBuses}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            >
              🔄 Check Availability Again
            </button>
            <button
              onClick={() => navigate('/dashboard/hosteller')}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              ← Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
