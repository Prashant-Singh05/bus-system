import React from 'react'

const colors = {
  on_time: 'bg-green-100 text-green-800',
  delayed: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-800'
}

export default function StatusBadge({ status }) {
  const key = (status || '').toLowerCase()
  const cls = colors[key] || 'bg-blue-100 text-blue-800'
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${cls}`}>{status}</span>
  )
}


