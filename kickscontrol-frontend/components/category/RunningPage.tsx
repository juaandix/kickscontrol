'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { formatPrice } from '@/lib/sheet'
import { BLEED, GUTTER, ShoeImage, categoryFigures, useCategoryProducts, useLoopVideo } from './shared'
import { runMono } from './fonts'

const VOLT = '#c8f031'

/** The plan the shoes are slotted into, from lightest to most cushioned (cheapest to priciest). */
const PLAN = [
  { session: 'Rodaje corto', distance: '5 km', pace: "5'30\"/km", note: 'Ligera y flexible para salir sin pensarlo.' },
  { session: 'Entreno diario', distance: '10 km', pace: "5'00\"/km", note: 'El equilibrio entre amortiguación y respuesta.' },
  { session: 'Tirada larga', distance: '21+ km', pace: "5'15\"/km", note: 'Máxima amortiguación para cuando las piernas pesan.' },
]

const CHECKLIST = [
  'Medio número más que en calle: el pie se hincha corriendo.',
  'Un dedo de espacio delante del dedo gordo.',
  'Calcetín técnico, nunca de algodón.',
  'Cambia de zapatilla cada 600–800 km.',
]

/** A stopwatch running since the visitor arrived: the session has started. Reduced motion keeps 00:00.00. */
function Stopwatch() {
  const [ms, setMs] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t0 = performance.now()
    let raf = 0
    const tick = (t: number) => { setMs(t - t0); raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  const pad = (n: number) => String(Math.floor(n)).padStart(2, '0')
  return (
    <span className="tabular-nums" aria-hidden>
      {pad(ms / 60000)}:{pad((ms / 1000) % 60)}.{pad((ms / 10) % 100)}
    </span>
  )
}

export function RunningPage({ video, poster }: { video: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useLoopVideo(ref)
  const { data: products = [] } = useCategoryProducts('Running')
  const plan = [...products].sort((a, b) => a.basePrice - b.basePrice)
  const f = categoryFigures(products)

  return (
    <div className={`${BLEED} ${runMono.variable} bg-[#0b0b0b] text-[#f2f2f2]`} style={{ colorScheme: 'dark' }}>
      {/* Distance covered: fills as you scroll the page, a marathon from top to bottom */}
      <div className="sticky top-16 z-30 border-b border-white/10 bg-[#0b0b0b]/90 backdrop-blur" aria-hidden>
        <div className={`${GUTTER} flex items-center gap-4 py-2 font-[family-name:var(--font-run)] text-[0.6875rem] text-white/60`}>
          <span>KM 0</span>
          <div className="relative h-1 flex-1 bg-white/10">
            <div className="run-progress absolute inset-y-0 left-0 w-full origin-left" style={{ background: VOLT }} />
          </div>
          <span>42,195</span>
        </div>
      </div>

      <section aria-labelledby="hero-title" className={`${GUTTER} grid gap-10 pt-12 pb-20 lg:grid-cols-12 lg:items-end lg:pt-20`}>
        <div className="lg:col-span-7">
          <p className="font-[family-name:var(--font-run)] text-xs tracking-[0.2em] text-white/50">SESIÓN 01 · RUNNING</p>
          <h1 id="hero-title" className="type-name mt-6 text-[clamp(3rem,8vw,7.5rem)]">
            Corre más lejos.<br /><span style={{ color: VOLT }}>Cansa menos.</span>
          </h1>
          <p className="mt-6 font-[family-name:var(--font-run)] text-[clamp(2.5rem,6vw,5rem)] leading-none" style={{ color: VOLT }}>
            <Stopwatch />
          </p>
          <p className="mt-6 max-w-md text-white/60">
            Zapatillas para rodar, tirar series o preparar tu primera carrera. Te decimos cuál para cada sesión, con el stock real de tu talla.
          </p>
          <a href="#plan" className="press mt-8 inline-block px-8 py-3.5 text-sm font-semibold text-[#0b0b0b]" style={{ background: VOLT }}>
            Ver el plan
          </a>
        </div>

        <div className="relative lg:col-span-5">
          <video
            ref={ref}
            className="bg-video aspect-[4/5] w-full object-cover"
            style={{ objectPosition: 'center 60%' }}
            src={video}
            poster={poster}
            muted
            loop
            playsInline
            aria-hidden
          />
          {/* Watch-face readout over the footage */}
          <dl className="absolute inset-x-0 bottom-0 grid grid-cols-3 gap-px bg-white/10 font-[family-name:var(--font-run)] text-xs" aria-hidden>
            {[['RITMO', "4'52\""], ['PULSO', '152'], ['DIST.', '8,4 km']].map(([k, v]) => (
              <div key={k} className="bg-black/70 px-3 py-2.5 backdrop-blur">
                <dt className="text-white/50">{k}</dt>
                <dd className="mt-0.5 text-sm text-white">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="plan" aria-labelledby="plan-title" className={`${GUTTER} scroll-mt-28 border-t border-white/10 py-20`}>
        <div className="flex flex-wrap items-baseline justify-between gap-4 pb-10">
          <h2 id="plan-title" className="type-style text-[clamp(2.5rem,5vw,4rem)]">El plan</h2>
          <p className="font-[family-name:var(--font-run)] text-xs text-white/50">SESIÓN · DISTANCIA · RITMO · ZAPATILLA</p>
        </div>

        <ol className="border-t border-white/15">
          {plan.map((product, i) => {
            const step = PLAN[Math.min(i, PLAN.length - 1)]
            return (
              <li key={product.id} className="scroll-in border-b border-white/15">
                <Link href={`/products/${product.id}`} className="group grid items-center gap-6 py-8 md:grid-cols-12">
                  <div className="md:col-span-4">
                    <p className="font-[family-name:var(--font-run)] text-xs text-white/40">0{i + 1}</p>
                    <p className="type-name mt-2 text-3xl">{step.session}</p>
                    <p className="mt-2 font-[family-name:var(--font-run)] text-sm" style={{ color: VOLT }}>
                      {step.distance} · {step.pace}
                    </p>
                    <p className="mt-3 max-w-xs text-sm text-white/50">{step.note}</p>
                  </div>
                  <div className="relative isolate aspect-[16/10] overflow-hidden bg-[#ececec] md:col-span-5">
                    <ShoeImage product={product} sizes="(max-width: 768px) 100vw, 40vw" className="transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="md:col-span-3 md:text-right">
                    <p className="text-sm text-white/50">{product.brand}</p>
                    <p className="text-xl font-semibold">{product.name}</p>
                    <p className="mt-1 font-[family-name:var(--font-run)]">{formatPrice(product.basePrice)}</p>
                    <span className="mt-4 inline-block text-sm underline-offset-4 group-hover:underline" style={{ color: VOLT }}>Ver zapatilla →</span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ol>
      </section>

      <section aria-labelledby="splits-title" className={`${GUTTER} grid gap-12 border-t border-white/10 py-20 lg:grid-cols-2`}>
        <div>
          <h2 id="splits-title" className="type-style text-[clamp(2rem,4vw,3rem)]">Parciales</h2>
          <p className="mt-2 text-sm text-white/50">La categoría hoy, desde el almacén.</p>
          <table className="mt-8 w-full font-[family-name:var(--font-run)] text-sm">
            <tbody>
              {[
                ['Modelos', String(f.models).padStart(2, '0')],
                ['Marcas', String(f.brands).padStart(2, '0')],
                ['Desde', formatPrice(f.from)],
                ['Pares en stock', String(f.pairs)],
              ].map(([k, v], i) => (
                <tr key={k} className="border-b border-white/10">
                  <td className="py-3 text-white/40">KM {(i + 1) * 10}</td>
                  <td className="py-3">{k}</td>
                  <td className="py-3 text-right text-lg" style={{ color: VOLT }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h2 className="type-style text-[clamp(2rem,4vw,3rem)]">Antes de salir</h2>
          <ul className="mt-8 space-y-4 font-[family-name:var(--font-run)] text-sm">
            {CHECKLIST.map(item => (
              <li key={item} className="flex gap-3">
                <span style={{ color: VOLT }} aria-hidden>[✓]</span>
                <span className="text-white/80">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <nav aria-label="Otras categorías" className={`${GUTTER} border-t border-white/10 py-12 font-[family-name:var(--font-run)] text-sm`}>
        <p className="text-white/40">SIGUIENTE TRAMO</p>
        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2">
          {[['basketball', 'Basketball'], ['lifestyle', 'Lifestyle'], ['skateboarding', 'Skateboarding']].map(([slug, name]) => (
            <Link key={slug} href={`/categoria/${slug}`} className="text-lg underline-offset-4 hover:underline">{name} →</Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
