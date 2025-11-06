import React, { useState } from 'react'
import api from '../api/client'

export default function RequestForm({ onSuccess, onError, onCancel }) {
  const [formData, setFormData] = useState({
    destination: '',
    date: '',
    time: '',
    reason: '',
    busId: ''
  })
  const [loading, setLoading] = useState(false)
  const [buses, setBuses] = useState([])

  React.useEffect(() => {
    // Fetch available buses
    api.get('/bus/list')
      .then(res => setBuses(res.data))
      .catch(() => setBuses([]))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data } = await api.post('/booking/request', {
        bus_id: formData.busId || null,
        destination: formData.destination,
        date: formData.date,
        preferredTime: formData.time,
        reason: formData.reason
      })
      if (onSuccess) onSuccess()
    } catch (error) {
      if (onError) onError(error?.response?.data?.message || 'Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-2xl p-6">
      <h3 className="text-2xl font-bold mb-4">New Booking Request</h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Destination */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400">📍</span>
            <input
              type="text"
              placeholder="Enter destination"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              required
            />
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">📅</span>
              <input
                type="date"
                placeholder="dd/mm/yyyy"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">⏰</span>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Travel</label>
          <textarea
            placeholder="Brief reason for travel"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 min-h-[96px] focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {buses.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Bus (Optional)
            </label>
            <select
              value={formData.busId}
              onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Any available bus</option>
              {buses.map(bus => (
                <option key={bus.bus_id} value={bus.bus_id}>
                  {bus.bus_no} - {bus.route}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-medium py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
          <button
            type="button"
            onClick={() => onCancel && onCancel()}
            className="px-5 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

