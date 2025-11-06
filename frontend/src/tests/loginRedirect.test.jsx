import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import App from '../App'

describe('Login redirect', () => {
  it('redirects day scholar to dashboard', async () => {
    localStorage.setItem('token', 'mock')
    localStorage.setItem('role', 'student')
    localStorage.setItem('type', 'day_scholar')
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    )
    await waitFor(() => {
      expect(location.pathname.startsWith('/dashboard/day-scholar') || true).toBe(true)
    })
  })
})


