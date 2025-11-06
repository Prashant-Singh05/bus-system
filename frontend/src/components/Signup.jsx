import React, { useState } from 'react'
import api from '../api/client'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [type, setType] = useState('day_scholar')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const emailValid = (v) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(v)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name || !email || !password) {
      setError('All fields are required')
      return
    }
    if (!emailValid(email)) {
      setError('Please enter a valid email')
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/signup', { name, email, password, type })
      localStorage.setItem('token', data.token)
      localStorage.setItem('role', data.user.role)
      localStorage.setItem('type', data.user.type)
      localStorage.setItem('name', data.user.name)
      localStorage.setItem('email', email)

      if (data.user.type === 'day_scholar') {
        window.location.href = '/dashboard/day-scholar'
      } else {
        window.location.href = '/dashboard/hosteller'
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Signup failed')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md">
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl p-6 sm:p-8 border border-white/60">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-800">Create your account</h2>
          <p className="text-gray-600 text-sm mt-1">Choose your role to get the right dashboard</p>
        </div>
        {error && <div className="text-red-600 bg-red-50 border border-red-200 rounded p-2 text-sm mb-3">{error}</div>}
        <div className="space-y-3">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400">👤</span>
            <input className="w-full border border-gray-200 focus:border-blue-500 outline-none rounded-lg pl-9 pr-3 py-2 text-gray-800" placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400">✉️</span>
            <input className="w-full border border-gray-200 focus:border-blue-500 outline-none rounded-lg pl-9 pr-3 py-2 text-gray-800" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400">🔒</span>
            <input className="w-full border border-gray-200 focus:border-blue-500 outline-none rounded-lg pl-9 pr-3 py-2 text-gray-800" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <div className="flex gap-2 items-center justify-center bg-gray-50 rounded-lg p-2 border border-gray-200">
            <button type="button" onClick={()=>setType('day_scholar')} className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition ${type==='day_scholar' ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:bg-white'}`}>🎓 Day Scholar</button>
            <button type="button" onClick={()=>setType('hosteller')} className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition ${type==='hosteller' ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:bg-white'}`}>🏠 Hosteler</button>
          </div>
          <button disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50">
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </div>
      </div>
      <div className="text-center text-sm text-gray-700 mt-3">Already have an account? <a href="/login" className="text-blue-600 hover:underline">Login</a></div>
    </form>
  )
}
