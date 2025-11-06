import React, { useEffect, useState } from 'react'
import api from '../api/client'

export default function BusStatus() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/bus/my')
        setData(res.data)
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load')
      } finally { setLoading(false) }
    })()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-600">{error}</div>

  if (data.status === 'pending') return <div className="status-card">Awaiting approval</div>
  if (data.status !== 'allocated') return <div className="status-card">No allocation</div>

  const a = data.allocation
  return (
    <div className="status-card">
      <h2 className="text-lg font-semibold">🚌 Bus {a.bus_no}</h2>
      <p>📍 Current Stop: {a.current_stop}</p>
      <p>⏱️ Next Stop: {a.next_stop}</p>
      <p>🕒 Last Updated: {a.last_updated ? new Date(a.last_updated).toLocaleTimeString() : 'N/A'}</p>
    </div>
  )
}
