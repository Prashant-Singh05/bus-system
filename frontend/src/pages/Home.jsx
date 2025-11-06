import React from 'react'
import Login from '../components/Login'

export default function Home({ loginOnly }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-6 items-center">
        {!loginOnly && (
          <div className="hidden md:block">
            <div className="bg-white/70 backdrop-blur rounded-2xl shadow-md p-8 border border-white/60">
              <div className="text-3xl font-bold text-gray-800 mb-2">JKLU Bus Management</div>
              <p className="text-gray-700 mb-4">Day Scholars & Hostelers can login to view buses, live status, and availability. Admin can approve requests and manage buses.</p>
              <ul className="text-gray-700 space-y-2">
                <li>🎓 Day Scholar dashboard</li>
                <li>🏠 Hosteler requests and status</li>
                <li>🚌 Live tracking & availability</li>
              </ul>
            </div>
          </div>
        )}
        <Login />
      </div>
    </div>
  )
}
