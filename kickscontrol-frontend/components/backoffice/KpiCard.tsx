'use client'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  /** Prints the figure in alarm red: something on the floor needs doing */
  alert?: boolean
}

/** One cell of the shift report: field name, the figure, and how it is worked out. */
export function KpiCard({ title, value, subtitle, alert = false }: KpiCardProps) {
  return (
    <div className="bg-paper px-4 py-4 sm:px-5 sm:py-5">
      <p className="type-field truncate">{title}</p>
      <p className={`type-name mt-2 text-[1.625rem] tabular-nums sm:text-[2rem] ${alert ? 'text-alarm' : ''}`}>{value}</p>
      {subtitle && <p className="type-label mt-2 text-[0.625rem] leading-snug text-ink-soft normal-case tracking-[0.02em]">{subtitle}</p>}
    </div>
  )
}

export function KpiCardSkeleton() {
  return (
    <div className="animate-pulse bg-paper px-4 py-4 sm:px-5 sm:py-5">
      <div className="h-3 w-2/3 bg-form-wash" />
      <div className="mt-3 h-7 w-1/2 bg-form-wash" />
      <div className="mt-3 h-2.5 w-3/4 bg-form-wash" />
    </div>
  )
}
