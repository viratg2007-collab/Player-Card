// Cricket overs are written in "over.ball" notation: 3.4 means 3 completed
// overs and 4 balls, NOT 3.4 of an over. There are 6 balls in an over.

const BALLS_PER_OVER = 6

// "3.4" (or 3.4) -> 22 balls
export function oversToBalls(overs) {
  const value = Number(overs) || 0
  const whole = Math.floor(value)
  // Round to avoid float dust like 3.4 -> 3.39999; balls are 0..5.
  const balls = Math.round((value - whole) * 10)
  return whole * BALLS_PER_OVER + balls
}

// 22 balls -> "3.4"
export function ballsToOvers(balls) {
  const total = Math.max(0, Math.floor(Number(balls) || 0))
  const whole = Math.floor(total / BALLS_PER_OVER)
  const rem = total % BALLS_PER_OVER
  return `${whole}.${rem}`
}

// Decimal overs for rate math: 22 balls -> 3.6667
export function oversToDecimal(overs) {
  return oversToBalls(overs) / BALLS_PER_OVER
}
