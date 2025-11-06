import { describe, it, expect } from 'vitest'

function minutesUntil(targetHHmm, nowHHmm) {
  const [th, tm] = targetHHmm.split(':').map(Number)
  const [nh, nm] = nowHHmm.split(':').map(Number)
  return (th*60+tm) - (nh*60+nm)
}

describe('Countdown utility', () => {
  it('computes minutes until departure', () => {
    expect(minutesUntil('09:00','08:30')).toBe(30)
  })
})


