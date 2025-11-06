import React, { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import ProgressTracker from '../components/ProgressTracker'

export default function Tracking() {
  const [buses, setBuses] = useState([])
  const [live, setLive] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)

  const fetchLive = async (bus_id) => {
    try {
      const { data } = await api.get(`/api/tracking/live/${bus_id}`)
      setLive(prev => ({ ...prev, [bus_id]: data }))
    } catch (e) {
      // ignore individual failure
    }
  }

  const fetchAll = async () => {
    setError('')
    try {
      const { data } = await api.get('/bus/list')
      setBuses(data)
      await Promise.all(data.map(b => fetchLive(b.bus_id)))
      if (data.length) setSelected(data[0].bus_id)
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load buses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    const t = setInterval(() => {
      buses.forEach(b => fetchLive(b.bus_id))
    }, 30000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Live Shuttle Tracking</h1>
          <p className="text-gray-600">Train-like progress tracker with real-time status and ETAs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            {buses.map(b => {
              const l = live[b.bus_id] || {}
              const isActive = selected === b.bus_id
              return (
                <button
                  key={b.bus_id}
                  onClick={() => setSelected(b.bus_id)}
                  className={`w-full text-left bg-white border rounded-lg p-4 shadow-sm hover:shadow transition ${isActive ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{b.route_name}</div>
                      <div className="text-sm text-gray-600">Bus {b.bus_no} • {b.driver_name}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      b.status === 'on_time' ? 'bg-green-100 text-green-700' :
                      b.status === 'delayed' ? 'bg-yellow-100 text-yellow-700' :
                      b.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>{b.status.replace('_',' ')}</span>
                  </div>
                  <div className="mt-2 text-sm">
                    <div>Current: <span className="font-medium">{l.current_stop || '—'}</span></div>
                    <div>Next: <span className="font-medium">{l.next_stop || '—'}</span> {l.eta ? <span className="text-gray-500">(ETA {l.eta})</span> : null}</div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selected && (() => {
              const b = buses.find(x => x.bus_id === selected)
              const l = live[selected] || {}
              if (!b) return null
              return (
                <>
                  <div className="bg-white rounded-lg border shadow-sm p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-lg font-semibold">{b.route_name}</div>
                        <div className="text-sm text-gray-600">Bus {b.bus_no} • {b.driver_name}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        b.status === 'on_time' ? 'bg-green-100 text-green-700' :
                        b.status === 'delayed' ? 'bg-yellow-100 text-yellow-700' :
                        b.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>{b.status.replace('_',' ')}</span>
                    </div>
                    <ProgressTracker 
                      routeName={b.route_name}
                      currentStop={l.current_stop}
                      nextStop={l.next_stop}
                      eta={l.eta}
                    />
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      </div>
    </div>
  )
}
