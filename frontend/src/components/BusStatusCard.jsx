import React from 'react'

export default function BusStatusCard({ busData }) {
  if (!busData) {
    return (
      <div className="bg-white shadow rounded-2xl p-6 border-l-4 border-gray-400">
        <h3 className="text-lg font-semibold text-gray-600">No Bus Assigned</h3>
        <p className="text-gray-500 mt-2">Your bus allocation is pending.</p>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'on_time':
        return 'border-green-500 bg-green-50'
      case 'delayed':
        return 'border-yellow-500 bg-yellow-50'
      case 'inactive':
        return 'border-gray-500 bg-gray-50'
      default:
        return 'border-blue-500 bg-blue-50'
    }
  }

  return (
    <div className={`bg-white shadow rounded-2xl p-6 border-l-4 ${getStatusColor(busData.bus_status)}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">🚌 Bus {busData.bus_no}</h3>
          <p className="text-gray-700 mb-1">
            <span className="font-semibold">Route:</span> {busData.route}
          </p>
          {busData.driver_name && (
            <p className="text-gray-700 mb-1">
              <span className="font-semibold">Driver:</span> {busData.driver_name}
            </p>
          )}
          <p className="text-gray-700 mb-1">
            <span className="font-semibold">Departure:</span> {busData.available_time || busData.start_time || 'N/A'}
          </p>
          {busData.eta && busData.eta !== 'N/A' && (
            <p className="text-gray-700 mb-1">
              <span className="font-semibold">ETA:</span> {busData.eta}
            </p>
          )}
          <p className="text-gray-700">
            <span className="font-semibold">Status:</span>{' '}
            <span className={`px-2 py-1 rounded text-sm font-medium ${
              busData.bus_status === 'active' || busData.bus_status === 'on_time' 
                ? 'bg-green-100 text-green-800' 
                : busData.bus_status === 'delayed'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {busData.bus_status === 'active' || busData.bus_status === 'on_time' 
                ? 'On Time' 
                : busData.bus_status === 'delayed'
                ? 'Delayed'
                : busData.bus_status || 'Active'}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

