import React from 'react'
import Signup from '../components/Signup'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-6 items-center">
        <div className="hidden md:block">
          <div className="bg-white/70 backdrop-blur rounded-2xl shadow-md p-8 border border-white/60">
            <div className="text-3xl font-bold text-gray-800 mb-2">Join JKLU Bus System</div>
            <p className="text-gray-700 mb-4">Create your account as Day Scholar or Hosteler to manage your daily commute easily.</p>
            <ul className="text-gray-700 space-y-2">
              <li>🕒 Schedules & countdowns</li>
              <li>🧭 Live route status</li>
              <li>📅 Availability & booking</li>
            </ul>
          </div>
        </div>
        <Signup />
      </div>
    </div>
  )
}
