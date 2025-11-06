import React from 'react'

export default function FilterBar({ values, onChange, routes }) {
  const set = (k, v) => onChange({ ...values, [k]: v })
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col md:flex-row gap-3 md:items-center">
      <select value={values.time} onChange={e => set('time', e.target.value)} className="border rounded-lg px-3 py-2">
        <option value="">All Times</option>
        <option value="morning">Morning (05:00-12:00)</option>
        <option value="evening">Evening (12:00-22:00)</option>
      </select>
      <select value={values.route} onChange={e => set('route', e.target.value)} className="border rounded-lg px-3 py-2">
        <option value="">All Routes</option>
        {routes.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      <select value={values.status} onChange={e => set('status', e.target.value)} className="border rounded-lg px-3 py-2">
        <option value="">Any Availability</option>
        <option value="available">Available</option>
        <option value="full">Full</option>
        <option value="scheduled">Scheduled</option>
      </select>
    </div>
  )
}


