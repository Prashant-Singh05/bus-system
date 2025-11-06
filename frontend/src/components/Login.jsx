import React, { useState } from 'react'
import api from '../api/client'

export default function Login() {
  // Credentials for auto-fill
  const credentials = {
    day_scholar: {
      email: 'aditi@jklu.edu.in',
      password: 'aditi123'
    },
    hosteller: {
      email: 'priya@jklu.edu.in',
      password: 'priya123'
    }
  }

  const [email, setEmail] = useState(credentials.day_scholar.email)
  const [password, setPassword] = useState(credentials.day_scholar.password)
  const [type, setType] = useState('day_scholar')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTypeChange = (newType) => {
    setType(newType)
    // Auto-fill credentials based on selected type
    if (newType === 'day_scholar') {
      setEmail(credentials.day_scholar.email)
      setPassword(credentials.day_scholar.password)
    } else if (newType === 'hosteller') {
      setEmail(credentials.hosteller.email)
      setPassword(credentials.hosteller.password)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    if (!email || !password) {
      setLoading(false)
      setError('Email and password are required')
      return
    }
    if (!/[^\s@]+@[^\s@]+\.[^\s@]+/.test(email)) {
      setLoading(false)
      setError('Please enter a valid email')
      return
    }
    try {
      // Send 'hostel' to backend if type is 'hosteller' (database uses 'hostel')
      const loginType = type === 'hosteller' ? 'hostel' : type
      const { data } = await api.post('/auth/login', { email, password, type: loginType })
      localStorage.setItem('token', data.token)
      localStorage.setItem('role', data.user.role)
      localStorage.setItem('type', data.user.type)
      localStorage.setItem('name', data.user.name)
      localStorage.setItem('email', email) // Store email for profile
      
      // Redirect based on role and type
      if (data.user.role === 'admin') {
        window.location.href = '/admin'
      } else if (data.user.type === 'day_scholar') {
        window.location.href = '/dashboard/day-scholar'
      } else if (data.user.type === 'hostel' || data.user.type === 'hosteller') {
        // Redirect to hosteller dashboard for both 'hostel' and 'hosteller' types
        window.location.href = '/dashboard/hosteller'
      } else {
        window.location.href = '/'
      }
    } catch (e) {
      console.error('Login error:', e)
      console.error('Error response:', e?.response)
      const errorMsg = e?.response?.data?.message || e?.message || 'Login failed. Please check your credentials.'
      setError(errorMsg)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md">
      <div className="bg-white/80 backdrop-blur rounded-2xl shadow-xl p-6 sm:p-8 border border-white/60">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-800">Welcome back</h2>
          <p className="text-gray-600 text-sm mt-1">Login to access your dashboard</p>
        </div>
        {error && <div className="text-red-600 bg-red-50 border border-red-200 rounded p-2 text-sm mb-3">{error}</div>}
        <div className="space-y-3">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400">✉️</span>
            <input className="w-full border border-gray-200 focus:border-blue-500 outline-none rounded-lg pl-9 pr-3 py-2 text-gray-800" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-400">🔒</span>
            <input className="w-full border border-gray-200 focus:border-blue-500 outline-none rounded-lg pl-9 pr-3 py-2 text-gray-800" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <div className="flex gap-2 items-center justify-center bg-gray-50 rounded-lg p-2 border border-gray-200">
            <button type="button" onClick={()=>handleTypeChange('day_scholar')} className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition ${type==='day_scholar' ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:bg-white'}`}>🎓 Day Scholar</button>
            <button type="button" onClick={()=>handleTypeChange('hosteller')} className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition ${type==='hosteller' ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:bg-white'}`}>🏠 Hosteler</button>
          </div>
          <button disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </div>
      <div className="text-center text-sm text-gray-700 mt-3">New here? <a href="/signup" className="text-blue-600 hover:underline">Create an account</a></div>
    </form>
  )
}
