import React from 'react'

// Known route sequences for train-like tracker
const ROUTE_SEQUENCES = {
  'Mansarovar → JKLU': ['Mansarovar Metro', 'Gopalpura', 'Tonk Road', 'JKLU'],
  'Vaishali Nagar → JKLU': ['Vaishali Nagar', 'Sodala', 'Gopalpura', 'JKLU'],
  'Malviya Nagar → JKLU': ['Malviya Nagar', 'Durgapura', 'Tonk Road', 'JKLU'],
  'Jagatpura → JKLU': ['Jagatpura', 'Malviya Nagar', 'JKLU'],
  'Ajmer Road → JKLU': ['Ajmer Road', 'Sodala', 'Tonk Road', 'JKLU']
}

export default function ProgressTracker({ routeName, currentStop, nextStop, eta }) {
  const seq = ROUTE_SEQUENCES[routeName] || []
  const idx = seq.indexOf(currentStop)
  const nextIdx = seq.indexOf(nextStop)

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">Route: {routeName}</div>
        {eta && nextStop && (
          <div className="text-sm text-gray-600">ETA to {nextStop}: <span className="font-medium">{eta}</span></div>
        )}
      </div>
      <ol className="space-y-2">
        {seq.map((stop, i) => {
          const isDone = idx !== -1 && i < idx
          const isCurrent = i === idx
          const isNext = i === nextIdx
          return (
            <li key={stop} className={`flex items-center gap-3 p-2 rounded border ${
              isCurrent ? 'bg-blue-50 border-blue-300' : isNext ? 'bg-yellow-50 border-yellow-300' : isDone ? 'bg-green-50 border-green-300' : 'border-gray-200'
            }`}>
              <span className={`text-lg ${isDone ? 'text-green-600' : isCurrent ? 'text-blue-600' : isNext ? 'text-yellow-600' : 'text-gray-400'}`}>
                {isDone ? '✔' : isCurrent ? '➤' : isNext ? '⏳' : '•'}
              </span>
              <span className={`flex-1 ${isCurrent ? 'font-semibold text-blue-800' : ''}`}>{stop}</span>
              {isNext && eta && (
                <span className="text-xs text-gray-600">ETA {eta}</span>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
