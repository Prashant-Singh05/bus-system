import React, { useState } from 'react'
import Header from '../components/Header'
import api from '../api/client'

export default function AdminNotifications() {
  const userName = localStorage.getItem('name') || 'Admin'
  const [form, setForm] = useState({ title: '', message: '', audience: 'all', target_user_id: '' })
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const onLogout = () => {
    localStorage.clear()
    window.location.href = '/login'
  }

  const send = async (e) => {
    e.preventDefault()
    setStatus('')
    setError('')
    try {
      const payload = {
        title: form.title || undefined,
        message: form.message,
        audience: form.audience,
        target_user_id: form.audience === 'user' && form.target_user_id ? Number(form.target_user_id) : undefined
      }
      await api.post('/admin/notifications', payload)
      setStatus('Notification sent')
      setForm({ title: '', message: '', audience: 'all', target_user_id: '' })
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to send')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <Header title="Send Notification" subtitle="Admin broadcast to users" userName={userName} onLogout={onLogout} profilePath="/admin/profile" />
        <form onSubmit={send} className="bg-white shadow rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Title (optional)</label>
            <input value={form.title} onChange={e=>setForm({ ...form, title: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Message</label>
            <textarea required value={form.message} onChange={e=>setForm({ ...form, message: e.target.value })} className="w-full border rounded-lg px-3 py-2 h-28" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Audience</label>
            <select value={form.audience} onChange={e=>setForm({ ...form, audience: e.target.value })} className="w-full border rounded-lg px-3 py-2">
              <option value="all">Everyone</option>
              <option value="students">Students</option>
              <option value="drivers">Bus Drivers</option>
              <option value="day_scholar">Day Scholars</option>
              <option value="hosteller">Hostellers</option>
              <option value="admins">Admins</option>
              <option value="user">Specific User ID</option>
            </select>
          </div>
          {form.audience === 'user' && (
            <div>
              <label className="block text-sm text-gray-700 mb-1">Target User ID</label>
              <input value={form.target_user_id} onChange={e=>setForm({ ...form, target_user_id: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
            </div>
          )}
          {status && <div className="text-green-600 text-sm">{status}</div>}
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex gap-3">
            <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Send</button>
            <a href="/admin" className="px-5 py-2 border rounded-lg">Back to Dashboard</a>
          </div>
        </form>
      </div>
    </div>
  )
}
