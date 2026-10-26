'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { formatPrice, isApparel } from '@/lib/sheet'
import type { Product } from '@/types'
import { Swatch } from '@/components/catalog/Swatch'
import {
  BLEED, GUTTER, OtherCategories, ShoeImage, categoryFigures, useCategoryProducts, useLoopVideo, useQuickAdd,
  type CategoryPageProps,
} from './shared'

const VOLT = '#c8f031'
const mono = 'font-[family-name:var(--font-run)]'

/** The plan the shoes slot into, from lightest to most cushioned (cheapest to priciest). */
const PLAN = [
  { session: 'Rodaje corto', distance: '5 km', pace: "5'30\"", note: 'Ligera y flexible para salir sin pensarlo.' },
  { session: 'Entreno diario', distance: '10 km', pace: "5'00\"", note: 'El equilibrio entre amortiguación y respuesta.' },
  { session: 'Tirada larga', distance: '21+ km', pace: "5'15\"", note: 'Máxima amortiguación para cuando las piernas pesan.' },
]

/** What the visitor is training for, and which session of the plan that calls for. */
const GOALS = [
  { label: '5K', step: 0 },
  { label: '10K', step: 1 },
  { label: 'Media', step: 2 },
  { label: 'Maratón', step: 2 },
]

const CHECKLIST = [
  'Medio número más que en calle: el pie se hincha corriendo.',
  'Un dedo de espacio delante del dedo gordo.',
  'Calcetín técnico, nunca de algodón.',
  'Cambia de zapatilla cada 600–800 km.',
]

/** Spread the shoes over the plan by price, whatever their number. */
const stepOf = (i: number, n: number) => (n <= 1 ? 1 : Math.round((i * (PLAN.length - 1)) / (n - 1)))

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
  return <span className="tabular-nums" aria-hidden>{pad(ms / 60000)}:{pad((ms / 1000) % 60)}.{pad((ms / 10) % 100)}</span>
}

/** Colour, size and add, laid out like the settings on a watch. */
function RunQuickAdd({ product }: { product: Product }) {
  const q = useQuickAdd(product)
  if (!q.colors.length) return <p className={`${mono} mt-4 text-xs text-white/40`}>SIN STOCK</p>
  return (
    <div className="mt-5 space-y-3">
      {q.colors.length > 1 && (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Color">
          {q.colors.map(c => (
            <button key={c} type="button" role="radio" aria-checked={q.color === c} onClick={() => q.setColor(c)} title={c}
              className={`press flex items-center gap-1.5 border px-2 py-1 ${mono} text-[0.6875rem] ${q.color === c ? 'border-[#c8f031] text-white' : 'border-white/15 text-white/50 hover:border-white/40'}`}>
              <Swatch color={c} className="size-3" /> {c}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Talla">
        {q.sizes.map(({ size, stock }) => (
          <button key={size} type="button" role="radio" aria-checked={q.size === size} disabled={stock === 0} onClick={() => q.setSize(size)}
            className={`press h-8 min-w-9 border px-1 ${mono} text-xs disabled:text-white/20 disabled:line-through ${q.size === size ? 'border-[#c8f031] bg-[#c8f031] text-black' : 'border-white/15 hover:border-white/50'}`}>
            {size}
          </button>
        ))}
      </div>
      <button type="button" onClick={q.add} disabled={!q.variant || q.status === 'adding'}
        className={`press h-10 w-full ${mono} text-xs font-bold tracking-wider text-black disabled:bg-white/10 disabled:text-white/40`}
        style={q.variant ? { background: VOLT } : undefined}>
        <span key={q.status} className={q.status === 'added' ? 'label-in inline-block' : undefined}>
          {q.status === 'added' ? '✓ AÑADIDA' : q.status === 'adding' ? 'AÑADIENDO…' : q.variant ? `AÑADIR · ${formatPrice(q.price)}` : 'ELIGE TALLA'}
        </span>
      </button>
    </div>
  )
}

export function RunningPage({ slug, video, poster, initialProducts }: CategoryPageProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const { playing, toggle } = useLoopVideo(ref)
  const { data: products = [], isPending } = useCategoryProducts('Running', initialProducts)
  const shoes = products.filter(p => !isApparel(p))
  const kit = products.filter(isApparel)
  const plan = [...shoes].sort((a, b) => a.basePrice - b.basePrice)
  const f = categoryFigures(shoes)
  const [goal, setGoal] = useState(GOALS[1])
  const step = PLAN[goal.step]
  const yours = plan.find((_, i) => stepOf(i, plan.length) === goal.step)

  return (
    <div className={`${BLEED}`}>
      {/* Distance covered: fills as you scroll the page, a marathon from top to bottom */}
      <div className="sticky top-16 z-30 border-b border-white/10 bg-[#0b0b0b]/90 backdrop-blur" aria-hidden>
        <div className={`${GUTTER} flex items-center gap-4 py-2 ${mono} text-[0.6875rem] text-white/60`}>
          <span>KM 0</span>
          <div className="relative h-1 flex-1 bg-white/10">
            <div className="run-progress absolute inset-y-0 left-0 w-full origin-left" style={{ background: VOLT }} />
          </div>
          <span>42,195</span>
        </div>
      </div>

      <section aria-labelledby="hero-title" className={`${GUTTER} grid gap-10 pt-12 pb-20 lg:grid-cols-12 lg:items-end lg:pt-20`}>
        <div className="lg:col-span-7">
          <p className={`${mono} run-sprint text-xs tracking-[0.2em] text-white/50`}>SESIÓN 01 · RUNNING</p>
          <h1 id="hero-title" className="type-name mt-6 text-[clamp(3rem,8vw,7.5rem)]">
            <span className="run-sprint block" style={{ '--d': '80ms' } as React.CSSProperties}>Corre más lejos.</span>
            <span className="run-sprint block" style={{ color: VOLT, '--d': '160ms' } as React.CSSProperties}>Cansa menos.</span>
          </h1>
          <p className={`${mono} mt-6 text-[clamp(2.5rem,6vw,5rem)] leading-none`} style={{ color: VOLT }}><Stopwatch /></p>

          {/* Goal picker: drives the watch readout and marks your shoe in the plan */}
          <fieldset className="mt-8">
            <legend className={`${mono} text-xs text-white/50`}>¿QUÉ VAS A CORRER?</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {GOALS.map(g => (
                <button key={g.label} type="button" aria-pressed={goal.label === g.label} onClick={() => setGoal(g)}
                  className={`press h-11 border px-5 ${mono} text-sm ${goal.label === g.label ? 'border-[#c8f031] bg-[#c8f031] text-black' : 'border-white/20 hover:border-white/60'}`}>
                  {g.label}
                </button>
              ))}
            </div>
          </fieldset>
          <a href={yours ? `#shoe-${yours.id}` : '#plan'} className="press mt-6 inline-block px-8 py-3.5 text-sm font-semibold text-[#0b0b0b]" style={{ background: VOLT }}>
            {yours ? `Tu zapatilla: ${yours.name}` : 'Ver el plan'}
          </a>
        </div>

        <div className="relative lg:col-span-5">
          <video ref={ref} className="bg-video aspect-[4/5] w-full object-cover" style={{ objectPosition: 'center 60%' }}
            src={video} poster={poster} muted loop playsInline preload="metadata" aria-hidden />
          <button type="button" onClick={toggle} className={`press absolute top-3 right-3 bg-black/60 px-3 py-1.5 ${mono} text-xs backdrop-blur`}
            aria-label={playing ? 'Pausar vídeo' : 'Reproducir vídeo'}>
            {playing ? '❚❚ PAUSA' : '▶ SEGUIR'}
          </button>
          {/* Watch-face readout: the session you picked */}
          <dl className={`absolute inset-x-0 bottom-0 grid grid-cols-3 gap-px bg-white/10 ${mono} text-xs`} aria-live="polite">
            {[['SESIÓN', step.session], ['DIST.', step.distance], ['RITMO', `${step.pace}/km`]].map(([k, v]) => (
              <div key={k} className="bg-black/70 px-3 py-2.5 backdrop-blur">
                <dt className="text-white/50">{k}</dt>
                <dd key={v} className="label-in mt-0.5 truncate text-sm text-white">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="plan" aria-labelledby="plan-title" className={`${GUTTER} scroll-mt-28 border-t border-white/10 py-20`}>
        <div className="flex flex-wrap items-baseline justify-between gap-4 pb-10">
          <h2 id="plan-title" className="type-style text-[clamp(2.5rem,5vw,4rem)]">El plan</h2>
          <p className={`${mono} text-xs text-white/50`}>SESIÓN · DISTANCIA · RITMO · ZAPATILLA</p>
        </div>

        <ol className="border-t border-white/15">
          {isPending && !products.length && PLAN.map(s => (
            <li key={s.session} className="grid animate-pulse gap-6 border-b border-white/15 py-8 md:grid-cols-12" aria-hidden>
              <div className="h-20 bg-white/5 md:col-span-4" /><div className="aspect-[16/10] bg-white/5 md:col-span-5" /><div className="h-20 bg-white/5 md:col-span-3" />
            </li>
          ))}
          {plan.map((product, i) => {
            const s = stepOf(i, plan.length)
            const session = PLAN[s]
            const active = s === goal.step
            return (
              <li key={product.id} id={`shoe-${product.id}`}
                className={`scroll-mt-28 border-b border-white/15 transition-opacity duration-300 ${active ? '' : 'opacity-45 hover:opacity-100 focus-within:opacity-100'}`}>
                <div className="grid items-start gap-6 py-8 md:grid-cols-12">
                  <div className="md:col-span-4">
                    <p className={`${mono} text-xs ${active ? '' : 'text-white/40'}`} style={active ? { color: VOLT } : undefined}>
                      0{i + 1}{active && ' · TU SESIÓN'}
                    </p>
                    <p className="type-name mt-2 text-3xl">{session.session}</p>
                    <p className={`${mono} mt-2 text-sm`} style={{ color: VOLT }}>{session.distance} · {session.pace}/km</p>
                    <p className="mt-3 max-w-xs text-sm text-white/50">{session.note}</p>
                  </div>
                  <Link href={`/products/${product.id}`} className="group relative isolate aspect-[16/10] overflow-hidden bg-[#ececec] md:col-span-5">
                    <ShoeImage product={product} sizes="(max-width: 768px) 100vw, 40vw" className="transition-transform duration-500 group-hover:scale-105" />
                  </Link>
                  <div className="md:col-span-3">
                    <p className="text-sm text-white/50">{product.brand}</p>
                    <Link href={`/products/${product.id}`} className="text-xl font-semibold underline-offset-4 hover:underline">{product.name}</Link>
                    <p className={`${mono} mt-1`}>{formatPrice(product.basePrice)}</p>
                    <RunQuickAdd product={product} />
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      {kit.length > 0 && (
        <section aria-labelledby="kit-title" className={`${GUTTER} border-t border-white/10 py-20`}>
          <div className="flex flex-wrap items-baseline justify-between gap-4 pb-10">
            <h2 id="kit-title" className="type-style text-[clamp(2.5rem,5vw,4rem)]">Equipación</h2>
            <p className={`${mono} text-xs text-white/50`}>LO QUE LLEVAS ENCIMA · {String(kit.length).padStart(2, '0')} PRENDAS</p>
          </div>
          <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {kit.map((item, i) => (
              <li key={item.id} className="scroll-in">
                <p className={`${mono} mb-3 text-xs text-white/40`}>[{i + 1 < 10 ? `0${i + 1}` : i + 1}] {item.gender === 'WOMAN' ? 'MUJER' : item.gender === 'MAN' ? 'HOMBRE' : 'UNISEX'}</p>
                <Link href={`/products/${item.id}`} className="group relative isolate block aspect-[4/5] overflow-hidden bg-[#1a1a1a]">
                  <ShoeImage product={item} sizes="(max-width: 640px) 100vw, 33vw" className="transition-transform duration-500 group-hover:scale-105" />
                </Link>
                <div className="mt-4 flex items-baseline justify-between gap-3">
                  <Link href={`/products/${item.id}`} className="text-lg font-semibold underline-offset-4 hover:underline">{item.name}</Link>
                  <p className={`${mono} shrink-0`}>{formatPrice(item.basePrice)}</p>
                </div>
                <p className="mt-1 text-sm text-white/50">{item.description}</p>
                <RunQuickAdd product={item} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="splits-title" className={`${GUTTER} grid gap-12 border-t border-white/10 py-20 lg:grid-cols-2`}>
        <div>
          <h2 id="splits-title" className="type-style text-[clamp(2rem,4vw,3rem)]">Parciales</h2>
          <p className="mt-2 text-sm text-white/50">La categoría hoy, desde el almacén.</p>
          <table className={`mt-8 w-full ${mono} text-sm`}>
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
          <ul className={`mt-8 space-y-4 ${mono} text-sm`}>
            {CHECKLIST.map(item => (
              <li key={item} className="flex gap-3">
                <span style={{ color: VOLT }} aria-hidden>[✓]</span>
                <span className="text-white/80">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <nav aria-label="Otras categorías" className={`${GUTTER} border-t border-white/10 py-12 ${mono} text-sm`}>
        <p className="text-white/40">SIGUIENTE TRAMO</p>
        <OtherCategories slug={slug} className="mt-4 flex flex-wrap gap-x-8 gap-y-2" linkClassName="text-lg underline-offset-4 hover:underline" render={t => `${t} →`} />
      </nav>
    </div>
  )
}
