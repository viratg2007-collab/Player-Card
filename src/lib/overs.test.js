import { describe, it, expect } from 'vitest'
import { oversToBalls, ballsToOvers, oversToDecimal } from './overs.js'

describe('oversToBalls', () => {
  it('converts cricket notation to balls (3.4 = 3 overs 4 balls)', () => {
    expect(oversToBalls(3.4)).toBe(22)
  })

  it('handles whole overs', () => {
    expect(oversToBalls(4)).toBe(24)
    expect(oversToBalls(4.0)).toBe(24)
  })

  it('handles zero and falsy input', () => {
    expect(oversToBalls(0)).toBe(0)
    expect(oversToBalls('')).toBe(0)
    expect(oversToBalls(undefined)).toBe(0)
  })

  it('is robust to float dust (3.4 not read as 3.39999)', () => {
    expect(oversToBalls(3.4)).toBe(22)
    expect(oversToBalls(0.5)).toBe(5)
  })

  it('accepts string input', () => {
    expect(oversToBalls('2.3')).toBe(15)
  })
})

describe('ballsToOvers', () => {
  it('converts balls back to cricket notation', () => {
    expect(ballsToOvers(22)).toBe('3.4')
    expect(ballsToOvers(24)).toBe('4.0')
    expect(ballsToOvers(0)).toBe('0.0')
  })

  it('round-trips with oversToBalls', () => {
    expect(ballsToOvers(oversToBalls(3.4))).toBe('3.4')
  })
})

describe('oversToDecimal', () => {
  it('gives decimal overs for rate math', () => {
    expect(oversToDecimal(3.4)).toBeCloseTo(3.6667, 3)
    expect(oversToDecimal(4)).toBe(4)
  })
})
