import React from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import DashboardDayScholar from './pages/DashboardDayScholar'
import DashboardHosteller from './pages/DashboardHosteller'
import AdminDashboard from './pages/AdminDashboard'
import SignupPage from './pages/Signup'
import Tracking from './pages/Tracking'
import AvailabilityChecker from './pages/AvailabilityChecker'

function PrivateRoute({ children, roles, userType }) {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const type = localStorage.getItem('type')
  
  if (!token) return <Navigate to="/login" replace />
  if (roles && !roles.includes(role)) return <Navigate to="/" replace />
  
  // Handle type matching - accept both 'hostel' and 'hosteller' for hosteller routes
  if (userType && role !== 'admin') {
    if (userType === 'hosteller') {
      // Accept both 'hostel' and 'hosteller' types
      if (type !== 'hostel' && type !== 'hosteller') {
        return <Navigate to="/" replace />
      }
    } else if (type !== userType) {
      return <Navigate to="/" replace />
    }
  }
  
  return children
}

export default function App() {
  const nav = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  const type = localStorage.getItem('type')

  // Redirect based on role and type after login
  React.useEffect(() => {
    if (token) {
      if (location.pathname === '/' || location.pathname === '/login') {
        if (role === 'admin') {
          nav('/admin', { replace: true })
        } else if (role === 'student') {
          if (type === 'day_scholar') {
            nav('/dashboard/day-scholar', { replace: true })
          } else if (type === 'hosteller' || type === 'hostel') {
            nav('/dashboard/hosteller', { replace: true })
          }
        }
      }
    }
  }, [token, role, type, nav, location.pathname])

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Home loginOnly />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route 
          path="/availability" 
          element={
            <PrivateRoute roles={["student","admin"]}>
              <AvailabilityChecker />
            </PrivateRoute>
          }
        />
        
        {/* Day Scholar Routes */}
        <Route 
          path="/dashboard/day-scholar/*" 
          element={
            <PrivateRoute roles={["student", "admin"]} userType="day_scholar">
              <DashboardDayScholar />
            </PrivateRoute>
          } 
        />
        
        {/* Hosteller Routes */}
        <Route 
          path="/dashboard/hosteller/*" 
          element={
            <PrivateRoute roles={["student", "admin"]} userType="hosteller">
              <DashboardHosteller />
            </PrivateRoute>
          } 
        />
        
        {/* Admin Route */}
        <Route 
          path="/admin/*" 
          element={
            <PrivateRoute roles={["admin"]}>
              <AdminDashboard />
            </PrivateRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
