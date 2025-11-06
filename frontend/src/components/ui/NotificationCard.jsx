import React from 'react'

const colorCls = {
  success: 'bg-green-50 border-green-100',
  warning: 'bg-yellow-50 border-yellow-100',
  info: 'bg-blue-50 border-blue-100'
}

export default function NotificationCard({ type='info', children }) {
  const cls = colorCls[type] || colorCls.info
  return (
    <div className={`rounded-lg p-3 border ${cls} text-sm transition-all`}>{children}</div>
  )
}


