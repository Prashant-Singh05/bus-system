import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import api from '../api/client'

export default function LiveStatus({ busId, route }) {
  const [stops, setStops] = useState([])
  const [loading, setLoading] = useState(true)
  const [eta, setEta] = useState(null)

  useEffect(() => {
    if (!busId) {
      setLoading(false)
      return
    }

    // Fetch initial status
    const fetchStatus = async () => {
      try {
        const { data } = await api.get(`/bus/status/${busId}`)
        updateStops(data)
        setLoading(false)
      } catch (e) {
        console.error('Error fetching bus status:', e)
        setLoading(false)
      }
    }

    fetchStatus()

    // Connect to Socket.IO for live updates
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4000', { 
      transports: ['websocket'] 
    })

    socket.on('connected', () => {
      console.log('Socket connected')
    })

    socket.on('bus_update', (data) => {
      if (data.bus_id === busId) {
        updateStops(data)
      }
    })

    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      fetchStatus()
    }, 30000)

    return () => {
      socket.close()
      clearInterval(interval)
    }
  }, [busId])

  const updateStops = (data) => {
    // Store ETA if available
    if (data.eta) {
      setEta(data.eta)
    }
    
    // Parse route into stops
    const routeStops = parseRouteStops(data.route || route)
    const currentStopIndex = routeStops.findIndex(stop => 
      stop.name === data.current_stop
    )
    
    setStops(routeStops.map((stop, index) => ({
      ...stop,
      status: index < currentStopIndex ? 'completed' : 
              index === currentStopIndex ? 'current' : 
              index === currentStopIndex + 1 ? 'next' : 'upcoming'
    })))
  }

  const parseRouteStops = (route) => {
    // Simple parsing: split by arrows or dashes
    if (!route || typeof route !== 'string') return []
    const stopNames = route
      .replace(/\s+to\s+/gi, '→')
      .replace(/->/g, '→')
      .split(/[–—-]|→/)
      .map(s => s.trim())
      .filter(s => s)
    
    return stopNames.map((name, index) => ({
      name,
      index,
      estimatedTime: index * 10 // Mock: 10 min between stops
    }))
  }

  if (loading) {
    return <div className="text-center py-4">Loading live status...</div>
  }

  if (stops.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-4">
        <p className="text-gray-600">No route information available</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">🚌 Live Route Status</h3>
      <div className="space-y-3">
        {stops.map((stop, index) => {
          const isCompleted = stop.status === 'completed'
          const isCurrent = stop.status === 'current'
          const isNext = stop.status === 'next'

          return (
            <div
              key={index}
              className={`flex items-center gap-4 pl-4 border-l-4 ${
                isCompleted
                  ? 'border-green-500'
                  : isCurrent
                  ? 'border-blue-500 bg-blue-50'
                  : isNext
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-gray-300'
              }`}
            >
              <div className="flex-1">
                {isCompleted && <span className="text-green-600 font-bold">✅</span>}
                {isCurrent && <span className="text-blue-600 font-bold">➡️</span>}
                {isNext && <span className="text-yellow-600 font-bold">⏳</span>}
                {!isCompleted && !isCurrent && !isNext && (
                  <span className="text-gray-400">⬜</span>
                )}
                <span className={`ml-2 ${isCurrent ? 'font-bold text-blue-700' : ''}`}>
                  {stop.name}
                </span>
              </div>
              {isCurrent && (
                <span className="text-sm text-gray-600">
                  {new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              )}
              {isNext && (
                <span className="text-sm text-gray-600">
                  {eta ? `ETA: ${eta}` : `ETA: +${stop.estimatedTime || 10} min`}
                </span>
              )}
              {isCurrent && eta && (
                <span className="text-sm text-blue-600 font-medium ml-2">
                  {eta} to next stop
                </span>
              )}
            </div>
          )
        })}
      </div>
      <p className="text-xs text-gray-500 mt-4 text-center">
        Updates every 30 seconds
      </p>
    </div>
  )
}

