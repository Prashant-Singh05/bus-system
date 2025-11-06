# 🚌 JKLU Bus Management System - Quick Start Guide

## ✅ Servers Started!

I've started both frontend and backend servers for you. Here's what's running:

### 🖥️ Running Services:
1. **Backend Server** - Running on `http://localhost:4000`
2. **Frontend Server** - Running on `http://localhost:5173`
3. **Bus Location Updater** - Updating bus ETAs every 30 seconds

### 🔑 Login Credentials:

#### Admin:
- **Email:** `admin@jklu.edu.in`
- **Password:** `admin123`

#### Day Scholars:
- **Aditi Sharma:** `aditi@jklu.edu.in` / `aditi123`
- **Rohan Singh:** `rohan@jklu.edu.in` / `rohan123`
- **Neha Saini:** `neha@jklu.edu.in` / `neha123`

#### Hostel Students:
- **Priya Meena:** `priya@jklu.edu.in` / `priya123`
- **Aman Verma:** `aman@jklu.edu.in` / `aman123`

### 🌐 Access URLs:
- **Frontend:** http://localhost:5173
- **Backend Health:** http://localhost:4000/health
- **API Base:** http://localhost:4000

### 📊 Database Status:
- Database: `college_bus_system`
- Tables: users, buses, routes, bookings, allocations, locations
- Sample data loaded with JKLU routes

### 🔄 Bus Location Updates:
The location updater runs automatically every 30 seconds to:
- Calculate ETAs between stops
- Update bus coordinates
- Track bus status (On Route/Delayed)

### 🛠️ Commands:

**Stop all servers:**
- Press `Ctrl+C` in the terminal where servers are running
- Or kill processes: `npm run kill:port4000`

**Restart servers:**
```bash
npm run dev
```

**Run location updater separately:**
```bash
cd backend
npm run update-locations
```

### 📝 Notes:
- Make sure MySQL is running with database `college_bus_system`
- If you see "Stop coordinates not found" warnings, update locations table with correct stop names from routes
- Bus ETAs are calculated using real Jaipur coordinates

### ✨ Features Available:
✅ Admin Dashboard with live tracking
✅ Day Scholar Dashboard with auto-assigned buses
✅ Hosteller Dashboard with booking requests
✅ Real-time bus status updates
✅ Route tracking with ETAs
✅ Driver information display

---

**System is ready to use! 🚀**


