import Link from 'next/link'
import Image from 'next/image'

const CATEGORIES = [
  { label: 'Running',    href: '/?category=Running' },
  { label: 'Basketball', href: '/?category=Basketball' },
  { label: 'Lifestyle',  href: '/?category=Lifestyle' },
  { label: 'Skateboarding', href: '/?category=Skateboarding' },
]

const HERO_SHOE =
  'https://static.nike.com/a/images/t_default/u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/a4ab0300-a514-4e86-b5be-d2ac53ef1ea8/AIR+JORDAN+1+RETRO+HIGH+OG.png'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-neutral-900 text-white min-h-[400px] sm:min-h-[460px]">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-96 w-96 rounded-full bg-orange-500 blur-[160px] opacity-25" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-orange-700 blur-[130px] opacity-20" />

      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg,transparent,transparent 40px,#fff 40px,#fff 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,#fff 40px,#fff 41px)',
        }}
      />

      {/* Layout */}
      <div className="relative flex items-center justify-between px-8 py-14 sm:py-20 gap-6">

        {/* Left — text */}
        <div className="flex-1 max-w-md z-10">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-orange-400">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            Nueva temporada
          </span>

          <h1 className="text-4xl font-black leading-[1.08] sm:text-5xl lg:text-6xl mt-3">
            Las mejores<br />
            zapatillas,<br />
            <span className="text-orange-500">en un solo lugar.</span>
          </h1>

          <p className="mt-5 max-w-xs text-base text-neutral-300 leading-relaxed">
            Running, basketball, lifestyle. Stock en tiempo real, envío inmediato.
          </p>

          <div className="mt-8 flex items-center gap-3 flex-wrap">
            <a
              href="#catalog"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-orange-400 hover:shadow-lg hover:shadow-orange-500/30 active:scale-95"
            >
              Ver catálogo
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Crear cuenta
            </Link>
          </div>

          {/* Category pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.label}
                href={cat.href}
                className="rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm transition-all hover:bg-white/15 hover:border-white/40"
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right — shoe image */}
        <div className="hidden md:block relative w-72 lg:w-80 xl:w-96 shrink-0 select-none" aria-hidden>
          {/* Glow under shoe */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-orange-500 blur-2xl opacity-40 rounded-full" />
          <Image
            src={HERO_SHOE}
            alt="Air Jordan 1 Retro High OG"
            width={420}
            height={420}
            className="object-contain drop-shadow-2xl"
            priority
            style={{ transform: 'rotate(-15deg) translateY(-8px)' }}
          />
        </div>
      </div>

      {/* Stats strip */}
      <div className="relative border-t border-white/10 px-8 py-4 flex gap-8">
        {[
          { value: '15+', label: 'Modelos' },
          { value: '6',   label: 'Marcas' },
          { value: '100+', label: 'Variantes' },
        ].map(stat => (
          <div key={stat.label} className="flex items-baseline gap-1.5">
            <span className="text-lg font-black text-orange-400">{stat.value}</span>
            <span className="text-xs text-neutral-400 font-medium">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
