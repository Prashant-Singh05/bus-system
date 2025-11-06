import React, { useEffect, useState } from 'react'
import api from '../api/client'

export default function Profile() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/auth/me')
        setData(res.data)
        setForm({
          name: res.data.name || '',
          email: res.data.email || '',
          contact_no: res.data.contact_no || '',
          address: res.data.address || '',
          hostel_block: '',
          room_no: '',
          emergency_name: '',
          emergency_phone: ''
        })
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load profile')
      } finally { setLoading(false) }
    })()
  }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSave = async () => {
    // Placeholder: backend update endpoint not implemented yet
    setEditing(false)
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!data) return null

  const roleBadge = (data.type === 'hostel' || data.type === 'hosteller') ? 'Hosteller' : (data.type === 'day_scholar' ? 'Day Scholar' : data.role)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-purple-600 to-pink-500">
        <div className="max-w-7xl mx-auto px-6 py-8 text-white">
          <a href={data.role === 'admin' ? '/admin' : (data.type === 'day_scholar' ? '/dashboard/day-scholar' : '/dashboard/hosteller')} className="text-sm opacity-90 hover:opacity-100">← Back to Dashboard</a>
          <div className="mt-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl">👤</div>
            <div>
              <div className="text-2xl font-bold">{data.name}</div>
              <span className="inline-block mt-1 text-xs bg-white/20 px-2 py-1 rounded-full">{roleBadge}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Profile Information</div>
            <button onClick={() => (editing ? onSave() : setEditing(true))} className="px-3 py-2 text-sm bg-blue-600 text-white rounded shadow">
              {editing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>
          <div className="mt-4 border-t" />

          <div className="mt-6 space-y-8">
            <section>
              <div className="font-semibold mb-3 flex items-center gap-2"><span>🧾</span> <span>Basic Information</span></div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Full Name</div>
                  <input name="name" value={form.name} onChange={onChange} disabled={!editing} className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-50 disabled:opacity-80" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Email Address</div>
                  <input name="email" value={form.email} onChange={onChange} disabled className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-50 disabled:opacity-80" />
                </div>
              </div>
            </section>

            <section>
              <div className="font-semibold mb-3 flex items-center gap-2"><span>📞</span> <span>Contact Information</span></div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Phone Number</div>
                  <input name="contact_no" value={form.contact_no} onChange={onChange} disabled={!editing} className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-50 disabled:opacity-80" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Address</div>
                  <input name="address" value={form.address} onChange={onChange} disabled={!editing} className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-50 disabled:opacity-80" />
                </div>
              </div>
            </section>

            <section>
              <div className="font-semibold mb-3 flex items-center gap-2"><span>🛟</span> <span>Emergency Contact</span></div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Contact Name</div>
                  <input name="emergency_name" value={form.emergency_name} onChange={onChange} disabled={!editing} className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-50 disabled:opacity-80" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Contact Number</div>
                  <input name="emergency_phone" value={form.emergency_phone} onChange={onChange} disabled={!editing} className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-50 disabled:opacity-80" />
                </div>
              </div>
            </section>

            {(data.type === 'hostel' || data.type === 'hosteller') && (
              <section>
                <div className="font-semibold mb-3 flex items-center gap-2"><span>🏠</span> <span>Hostel Information</span></div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Hostel Block</div>
                    <input name="hostel_block" value={form.hostel_block} onChange={onChange} disabled={!editing} className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-50 disabled:opacity-80" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Room Number</div>
                    <input name="room_no" value={form.room_no} onChange={onChange} disabled={!editing} className="mt-1 w-full border rounded-lg px-3 py-2 bg-gray-50 disabled:opacity-80" />
                  </div>
                </div>
              </section>
            )}

            <section>
              <div className="font-semibold mb-3 flex items-center gap-2"><span>🔒</span> <span>Security</span></div>
              <button className="px-3 py-2 text-sm border rounded-lg">Change Password</button>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
