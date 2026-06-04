import Link from 'next/link'
import { ArrowDownIcon } from '@heroicons/react/24/outline'

const CATEGORIES = [
  { label: 'Running', value: 'RUNNING' },
  { label: 'Basketball', value: 'BASKETBALL' },
  { label: 'Lifestyle', value: 'LIFESTYLE' },
  { label: 'Training', value: 'TRAINING' },
  { label: 'Skate', value: 'SKATE' },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-neutral-900 px-8 py-16 sm:py-24 text-white">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-orange-500 blur-[140px] opacity-20" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-orange-700 blur-[120px] opacity-15" />

      {/* Grid texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg,transparent,transparent 40px,#fff 40px,#fff 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,#fff 40px,#fff 41px)',
        }}
      />

      {/* Content */}
      <div className="relative max-w-lg">
        <span className="mb-4 inline-block rounded-full bg-orange-500/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-orange-400">
          Nueva temporada
        </span>

        <h1 className="text-4xl font-black leading-[1.1] sm:text-5xl lg:text-6xl">
          Las mejores<br />
          zapatillas,<br />
          <span className="text-orange-500">en un solo lugar.</span>
        </h1>

        <p className="mt-5 max-w-sm text-base text-neutral-400">
          Running, basketball, lifestyle. Encuentra tu modelo con stock en tiempo real y envío inmediato.
        </p>

        <a
          href="#catalog"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-600"
        >
          Ver catálogo
          <ArrowDownIcon className="h-4 w-4" />
        </a>
      </div>

      {/* Category pills */}
      <div className="relative mt-10 flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <Link
            key={cat.value}
            href={`/?category=${cat.value}`}
            className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            {cat.label}
          </Link>
        ))}
      </div>
    </section>
  )
}
