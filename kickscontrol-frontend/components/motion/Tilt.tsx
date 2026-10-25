'use client'

import { useRef } from 'react'

interface Props {
  children: React.ReactNode
  className?: string
  /** Maximum rotation in degrees at the element's edge */
  max?: number
}

/** Leans its content toward a mouse pointer in 3D; touch and pen leave it flat. */
export function Tilt({ children, className = '', max = 8 }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el || e.pointerType !== 'mouse') return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${(x * max * 2).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${(-y * max * 2).toFixed(2)}deg`)
    el.dataset.active = ''
  }

  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    delete el.dataset.active
  }

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={`tilt ${className}`}>
      {children}
    </div>
  )
}
