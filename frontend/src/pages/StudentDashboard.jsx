import React from 'react'
import BusStatus from '../components/BusStatus'

export default function StudentDashboard() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Student Dashboard</h2>
      <BusStatus />
    </div>
  )
}
