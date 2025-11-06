Bus Management System - Frontend

Tech: React + Vite + TailwindCSS

Quick start
1) cd frontend
2) create .env with: VITE_API_URL=http://localhost:4000
3) npm install
4) npm run dev

Scripts
- dev: start Vite
- build: production build
- preview: preview build
- test / test:ui: Vitest unit tests

Main flows
- Login; redirect based on role/type
- Day Scholar dashboard shows assigned bus and live tracking
- Hosteller dashboard includes inline request form and status
- Bus Details lists routes and availability

Backend requirements
- Database must contain: users, allocations, buses, locations
- For live tracking, each allocated bus must have a locations row


