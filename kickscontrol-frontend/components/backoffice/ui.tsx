'use client'

import { useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

/* The stockroom's own furniture: the store's white sheet, square corners, ink buttons, label lettering. */

export const inputCls =
  'h-10 w-full border border-form-rule bg-paper px-3 text-sm text-ink placeholder:text-ink-soft/70 focus:border-ink focus:outline-none'
export const labelCls = 'type-field mb-1.5 block'
export const btnPrimary =
  'press inline-flex h-10 items-center justify-center gap-2 bg-ink px-4 text-sm font-semibold text-paper hover:bg-form-deep disabled:cursor-not-allowed disabled:bg-paper-deep disabled:text-ink-soft'
export const btnGhost =
  'press inline-flex h-10 items-center justify-center gap-2 border border-form-rule px-4 text-sm font-semibold text-ink hover:border-ink disabled:opacity-40'
export const btnIcon =
  'press inline-flex size-8 items-center justify-center text-ink-soft hover:bg-form-wash hover:text-ink'

/** Kicker in label lettering, the page name, and the page's own actions on the right. */
export function PageHead({ kicker, title, children }: { kicker: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-4 border-b border-ink pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="type-label text-ink-soft">{kicker}</p>
        <h1 className="type-name mt-2 text-[2rem] sm:text-[2.5rem]">{title}</h1>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  )
}

/** A ruled block with a section head. */
export function Panel({ title, aside, children, className = '' }: { title: string; aside?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`border border-form-rule bg-paper ${className}`}>
      <div className="flex items-baseline justify-between gap-3 border-b border-form-rule px-4 py-3 sm:px-5">
        <h2 className="text-sm font-bold uppercase tracking-[0.02em]">{title}</h2>
        {aside && <div className="type-label text-ink-soft">{aside}</div>}
      </div>
      {children}
    </section>
  )
}

/** Units on a shelf: red when gone, red and bold when it's the last few. */
export function Units({ n, low = 5, className = '' }: { n: number; low?: number; className?: string }) {
  const tone = n === 0 ? 'text-alarm line-through decoration-1' : n <= low ? 'font-bold text-alarm' : 'text-ink'
  return <span className={`type-label text-[0.8125rem] tabular-nums ${tone} ${className}`}>{n}</span>
}

/** A sheet over a dimmed backroom. Escape and the backdrop close it. */
export function Modal({ title, kicker, onClose, children, wide = false }: {
  title: string
  kicker?: string
  onClose: () => void
  children: React.ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="overlay-in fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={e => e.stopPropagation()}
        className={`fade-up flex max-h-[92vh] w-full flex-col bg-paper shadow-[var(--lift-2)] ${wide ? 'sm:max-w-2xl' : 'sm:max-w-md'}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink px-5 py-4">
          <div className="min-w-0">
            {kicker && <p className="type-label text-ink-soft">{kicker}</p>}
            <h2 className="type-name mt-1 truncate text-xl">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className={btnIcon} aria-label="Cerrar">
            <XMarkIcon className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function FormError({ children }: { children: React.ReactNode }) {
  return <p role="alert" className="border-l-2 border-alarm bg-form-wash px-3 py-2 text-sm text-alarm">{children}</p>
}

/** Shimmering placeholder block. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-form-wash ${className}`} />
}
