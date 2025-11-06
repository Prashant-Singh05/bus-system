import React from 'react'
import Header from '../components/Header'
import FilterBar from '../components/availability/FilterBar'
import BusCard from '../components/availability/BusCard'
import api from '../api/client'

export default function AvailabilityChecker() {
  const userName = localStorage.getItem('name') || 'Student'
  const [buses, setBuses] = React.useState([])
  const [filters, setFilters] = React.useState({ time: '', route: '', status: '' })
  const [routes, setRoutes] = React.useState([])

  const fetchBuses = async () => {
    try {
      const { data } = await api.get('/bus/list')
      setBuses(data || [])
      const uniqueRoutes = Array.from(new Set((data || []).map(b => b.route_name).filter(Boolean)))
      setRoutes(uniqueRoutes)
    } catch {}
  }

  React.useEffect(() => { fetchBuses() }, [])

  const withinTime = (start, slot) => {
    if (!slot || !start) return true
    const hour = Number(String(start).slice(0,2)) || 0
    if (slot === 'morning') return hour >= 5 && hour < 12
    if (slot === 'evening') return hour >= 12 && hour <= 22
    return true
  }

  const filtered = buses.filter(b => (
    withinTime(b.start_time, filters.time)
    && (!filters.route || b.route_name === filters.route)
    && (!filters.status || (filters.status === 'scheduled' ? true : (b.availability === filters.status)))
  ))

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userName={userName} title="Bus Availability Checker" showProfileMenu />
      <main className="p-6 space-y-4">
        <FilterBar values={filters} onChange={setFilters} routes={routes} />
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-6 text-gray-600">
            No buses available for this time and route. Please check another slot or contact admin.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(bus => (
              <BusCard key={bus.bus_id} bus={bus} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}


