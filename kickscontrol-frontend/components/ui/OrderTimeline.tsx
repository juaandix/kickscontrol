import type { OrderStatus } from '@/types'
import {
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  HomeIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid'

interface Step {
  status: OrderStatus
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const STEPS: Step[] = [
  { status: 'PENDING',   label: 'Pendiente',  icon: ClockIcon },
  { status: 'CONFIRMED', label: 'Confirmado', icon: CheckCircleIcon },
  { status: 'SHIPPED',   label: 'Enviado',    icon: TruckIcon },
  { status: 'DELIVERED', label: 'Entregado',  icon: HomeIcon },
]

const STATUS_ORDER: Record<OrderStatus, number> = {
  PENDING: 0, CONFIRMED: 1, SHIPPED: 2, DELIVERED: 3, CANCELLED: -1,
}

interface Props {
  status: OrderStatus
}

export function OrderTimeline({ status }: Props) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
        <XCircleIcon className="w-6 h-6 text-red-500 shrink-0" />
        <div>
          <p className="font-bold text-red-700">Pedido cancelado</p>
          <p className="text-xs text-red-500 mt-0.5">Este pedido fue cancelado y no se procesará.</p>
        </div>
      </div>
    )
  }

  const currentIdx = STATUS_ORDER[status] ?? 0

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 px-5 py-5">
      <p className="text-xs font-bold text-neutral-600 uppercase tracking-widest mb-5">Estado del pedido</p>

      <div className="relative flex items-start">
        {/* Progress bar */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-neutral-200 mx-8" aria-hidden>
          <div
            className="h-full bg-orange-500 transition-all duration-500"
            style={{ width: currentIdx === 0 ? '0%' : `${(currentIdx / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {STEPS.map((step, idx) => {
          const done = idx < currentIdx
          const active = idx === currentIdx

          return (
            <div key={step.status} className="relative flex flex-col items-center flex-1 gap-2">
              {/* Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors ${
                  done
                    ? 'bg-orange-500 text-white'
                    : active
                      ? 'bg-white border-2 border-orange-500 text-orange-500'
                      : 'bg-white border-2 border-neutral-200 text-neutral-300'
                }`}
              >
                {done
                  ? <CheckCircleSolid className="w-5 h-5" />
                  : <step.icon className="w-4 h-4" />}
              </div>

              {/* Label */}
              <span
                className={`text-xs font-semibold text-center leading-tight ${
                  active ? 'text-orange-600' : done ? 'text-neutral-700' : 'text-neutral-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
