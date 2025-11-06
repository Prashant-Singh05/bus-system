import React from 'react'

export default function Timeline({ stops }) {
  return (
    <div className="space-y-4">
      {stops.map((s, idx) => {
        const isCurrent = s.status === 'current'
        const isCompleted = s.status === 'completed'
        return (
          <div key={idx} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <span className={`h-3 w-3 rounded-full ${isCurrent ? 'bg-blue-600 animate-pulse' : isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}></span>
              {idx !== stops.length - 1 && <span className="h-8 w-px bg-gray-300"></span>}
            </div>
            <div className={`flex-1 ${isCurrent ? 'font-semibold text-blue-700' : ''}`}>{s.name}</div>
          </div>
        )
      })}
    </div>
  )
}


