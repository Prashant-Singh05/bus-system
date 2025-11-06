import React from 'react'

function StatusBadge({ availability, status }) {
  const map = {
    available: 'bg-green-100 text-green-800',
    full: 'bg-red-100 text-red-800',
    scheduled: 'bg-blue-100 text-blue-800'
  }
  const cls = map[availability] || map.scheduled
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls}`}>{availability || status}</span>
}

export default function BusCard({ bus }) {
  const seatsText = `${Math.max((bus.capacity || 0) - (bus.seats_left || 0), (bus.occupied || 0))}/${bus.capacity || '∞'} seats filled`
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-semibold">Bus {bus.bus_no}</div>
          <div className="text-sm text-gray-600">{bus.route_name}</div>
        </div>
        <StatusBadge availability={bus.availability} status={bus.status} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-700">
        <div>
          <div className="text-gray-500">Departure</div>
          <div className="font-medium">{bus.start_time || '—'}</div>
        </div>
        <div>
          <div className="text-gray-500">Driver</div>
          <div className="font-medium">{bus.driver_name || '—'}</div>
        </div>
        <div className="col-span-2">
          <div className="text-gray-500">Capacity</div>
          <div className="font-medium">{seatsText}</div>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button disabled className="px-3 py-2 rounded-lg border border-gray-300 text-gray-400 cursor-not-allowed" title="Only admin can view live location">View Live Location</button>
      </div>
    </div>
  )
}


