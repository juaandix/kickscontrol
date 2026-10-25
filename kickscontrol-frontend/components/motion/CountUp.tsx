'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  /** Count from zero on mount (the sheet printing); otherwise only roll on change */
  fromZero?: boolean
  delay?: number
  duration?: number
  format?: (n: number) => string
}

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** A figure that counts to its value with a decelerating roll. */
export function CountUp({ value, fromZero = false, delay = 0, duration = 750, format = n => String(Math.round(n)) }: Props) {
  // Counting starts at 60% of the real figure, so an in-stock cell never reads 0
  const start = fromZero ? value * 0.6 : value
  const [shown, setShown] = useState(start)
  const current = useRef(start)

  useEffect(() => {
    const from = current.current
    if (from === value) return
    let raf = 0
    const instant = reducedMotion()
    const t0 = performance.now() + (instant ? 0 : delay)
    const tick = (t: number) => {
      const p = instant ? 1 : Math.min(1, Math.max(0, (t - t0) / duration))
      const n = from + (value - from) * (1 - Math.pow(1 - p, 4))
      current.current = n
      setShown(n)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, delay, duration])

  return <>{format(shown)}</>
}
