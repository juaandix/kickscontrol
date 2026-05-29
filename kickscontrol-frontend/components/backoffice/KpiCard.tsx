'use client'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  accentColor?: string
}

export function KpiCard({ title, value, subtitle, icon, accentColor = 'bg-orange-100 text-orange-600' }: KpiCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${accentColor}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide truncate">{title}</p>
        <p className="text-2xl font-black text-neutral-900 mt-0.5 leading-tight">{value}</p>
        {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

export function KpiCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5 flex items-start gap-4 animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-neutral-200 shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 bg-neutral-200 rounded w-2/3" />
        <div className="h-6 bg-neutral-200 rounded w-1/2" />
        <div className="h-3 bg-neutral-200 rounded w-1/3" />
      </div>
    </div>
  )
}
