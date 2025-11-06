import React from 'react'

export default function TimeCard() {
  const now = new Date()
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  const date = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="rounded-2xl p-6 text-white shadow-md bg-gradient-to-br from-purple-600 to-fuchsia-600 min-w-[260px]">
      <div className="text-sm opacity-90">Current Time</div>
      <div className="text-3xl font-bold mt-1">{time}</div>
      <div className="text-sm mt-2 opacity-90">{date}</div>
    </div>
  )
}


