'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { formatPrice, isApparel, LOW_STOCK, sortSizes } from '@/lib/sheet'
import type { Product } from '@/types'
import { Swatch } from '@/components/catalog/Swatch'
import {
  BLEED, GUTTER, OtherCategories, ShoeImage, categoryFigures, useCategoryProducts, useLoopVideo, useQuickAdd,
  type CategoryPageProps,
} from './shared'

const BALL = '#e8590c'
const display = 'font-[family-name:var(--font-court)] uppercase'

const PLAYBOOK = [
  { title: 'Bota alta o baja', body: 'Caña alta para estabilizar el tobillo en interior; baja para ganar velocidad en la calle o llevarlas a diario.', play: 'M10 50 Q 40 10 70 40 T 110 20', start: 50 },
  { title: 'Tracción', body: 'Suela de goma con dibujo en espiga: frena en seco y arranca sin resbalar en el cambio de dirección.', play: 'M10 20 L 60 50 L 110 15', start: 20 },
  { title: 'Sujeción', body: 'Acolchado en el talón y cordones hasta arriba: el pie no baila dentro cuando aterrizas.', play: 'M10 40 Q 60 60 110 40 M60 52 L 60 10', start: 40 },
]

/** 24-second shot clock that keeps resetting. Reduced motion holds it at 24. */
function ShotClock() {
  const [s, setS] = useState(24)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setS(v => (v <= 1 ? 24 : v - 1)), 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="tabular-nums">{String(s).padStart(2, '0')}</span>
}

/** Half-court markings, drawn in chalk over the floor. */
function CourtLines({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 500 470" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden>
      <rect x="1" y="1" width="498" height="468" />
      <rect x="170" y="1" width="160" height="190" />
      <circle cx="250" cy="191" r="60" />
      <path d="M30 1 V 140 A 220 220 0 0 0 470 140 V 1" />
      <circle cx="250" cy="40" r="7.5" />
      <path d="M220 30 H 280" />
      <path d="M190 469 A 60 60 0 0 1 310 469" />
    </svg>
  )
}

/**
 * A trading card for the shoe. The front is the player; the back is its stat sheet — the real stock
 * for every size and colour — and picking a cell there signs the pair into the cart.
 */
function PlayerCard({ product }: { product: Product }) {
  const [flipped, setFlipped] = useState(false)
  const q = useQuickAdd(product)
  const colors = [...new Set(product.variants.map(v => v.color))]
  const sizes = sortSizes([...new Set(product.variants.map(v => v.size))])
  const stockOf = (color: string, size: string) => product.variants.find(v => v.color === color && v.size === size)?.stockQuantity ?? 0

  return (
    <div className="flip-card w-full max-w-sm" data-flipped={flipped || undefined}>
      <div className="flip-inner">
        {/* Front */}
        <div className="flip-face -rotate-1 bg-[#f6efe6] p-3 text-[#10151f] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]" inert={flipped}>
          <Link href={`/products/${product.id}`} className="group relative isolate block aspect-[4/5] overflow-hidden" style={{ background: `linear-gradient(160deg, ${BALL}, #ff922b)` }}>
            <span className={`${display} absolute top-2 left-3 z-10 text-7xl font-black text-white/90 [text-shadow:0_2px_12px_rgba(0,0,0,0.35)]`}>#{String(product.id).padStart(2, '0')}</span>
            <ShoeImage product={product} sizes="384px" pad="p-8" className="transition-transform duration-500 group-hover:scale-105" />
            <span className={`${display} absolute right-3 bottom-2 z-10 text-sm font-bold text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.4)]`}>{product.brand}</span>
          </Link>
          <p className={`${display} mt-3 text-3xl leading-none font-black`}>{product.name}</p>
          <dl className="mt-3 grid grid-cols-4 border-t-2 border-[#10151f] pt-2 text-center">
            {[['Tallas', sizes.length], ['Colores', colors.length], ['Stock', product.totalStock ?? '—'], ['Precio', formatPrice(product.basePrice)]].map(([k, v]) => (
              <div key={k}>
                <dt className={`${display} text-[0.625rem] font-bold text-[#10151f]/60`}>{k}</dt>
                <dd className={`${display} text-lg font-black`}>{v}</dd>
              </div>
            ))}
          </dl>
          <button type="button" onClick={() => setFlipped(true)} className={`${display} press mt-3 h-11 w-full bg-[#10151f] text-sm font-black text-white`}>
            Ver estadísticas ↻
          </button>
        </div>

        {/* Back: the stat sheet */}
        <div className="flip-face flip-back flex flex-col rotate-1 bg-[#10151f] p-4 text-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] ring-2 ring-[#e8590c]" inert={!flipped}>
          <div className="flex items-baseline justify-between">
            <p className={`${display} text-2xl font-black`}>Estadísticas</p>
            <p className={`${display} text-xs font-bold text-white/50`}>Pares por talla</p>
          </div>
          <div className="mt-3 flex-1 overflow-auto">
            <table className={`${display} w-full text-center text-sm font-bold`}>
              <thead>
                <tr>
                  <th className="py-1 text-left text-[0.625rem] text-white/50">Talla</th>
                  {colors.map(c => (
                    <th key={c} className="py-1 text-[0.625rem] text-white/70" title={c}>
                      <span className="inline-flex items-center gap-1"><Swatch color={c} className="size-3" /> {c}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sizes.map(size => (
                  <tr key={size} className="border-t border-white/10">
                    <th className="py-1 text-left font-black">{size}</th>
                    {colors.map(color => {
                      const stock = stockOf(color, size)
                      const picked = q.color === color && q.size === size
                      return (
                        <td key={color} className="p-0.5">
                          <button type="button" disabled={stock === 0} aria-pressed={picked}
                            aria-label={`${color}, talla ${size}: ${stock} pares`}
                            onClick={() => { q.setColor(color); q.setSize(size) }}
                            className={`press h-8 w-full tabular-nums disabled:text-white/20 ${picked ? 'bg-[#e8590c] text-white' : stock <= LOW_STOCK ? 'text-[#ff922b] hover:bg-white/10' : 'hover:bg-white/10'}`}>
                            {stock}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={q.add} disabled={!q.variant || q.status === 'adding'}
            className={`${display} press mt-3 h-11 w-full text-sm font-black disabled:bg-white/10 disabled:text-white/40`}
            style={q.variant ? { background: BALL } : undefined}>
            <span key={q.status} className={q.status === 'added' ? 'label-in inline-block' : undefined}>
              {q.status === 'added' ? '✓ Fichada' : q.status === 'adding' ? 'Fichando…' : q.variant ? `Fichar · ${formatPrice(q.price)}` : 'Elige talla y color'}
            </span>
          </button>
          <button type="button" onClick={() => setFlipped(false)} className={`${display} press mt-2 h-9 text-xs font-bold text-white/60 hover:text-white`}>
            ↺ Volver a la carta
          </button>
        </div>
      </div>
    </div>
  )
}

/** A piece of kit hanging in its locker: numbered plate, the garment, sizes on the bench below. */
function Locker({ product, n }: { product: Product; n: number }) {
  const q = useQuickAdd(product)
  return (
    <article className="scroll-in flex flex-col border-2 border-white/15 bg-[#0c1018]">
      <div className="flex items-center justify-between border-b-2 border-white/15 px-4 py-2">
        <span className={`${display} text-sm font-black text-white/50`}>Taquilla</span>
        <span className={`${display} text-2xl font-black`} style={{ color: BALL }}>{String(n).padStart(2, '0')}</span>
      </div>
      {/* Locker vents */}
      <div className="flex gap-1.5 px-4 pt-3" aria-hidden>{Array.from({ length: 6 }, (_, i) => <span key={i} className="h-1 flex-1 bg-white/10" />)}</div>
      <Link href={`/products/${product.id}`} className="group relative isolate m-4 block aspect-[4/5] overflow-hidden bg-[#1b2230]">
        <ShoeImage product={product} sizes="(max-width: 768px) 100vw, 33vw" className="transition-transform duration-500 group-hover:scale-105" />
      </Link>
      <div className="mt-auto px-4 pb-4">
        <p className={`${display} text-xs font-bold text-white/50`}>{product.brand}</p>
        <Link href={`/products/${product.id}`} className={`${display} block text-2xl leading-none font-black hover:underline`}>{product.name}</Link>
        <div className="mt-3 flex flex-wrap gap-1" role="radiogroup" aria-label="Talla">
          {q.sizes.map(({ size, stock }) => (
            <button key={size} type="button" role="radio" aria-checked={q.size === size} disabled={stock === 0} onClick={() => q.setSize(size)}
              className={`${display} press h-9 min-w-10 border-2 px-1 text-sm font-black disabled:text-white/20 ${q.size === size ? 'border-[#e8590c] bg-[#e8590c]' : 'border-white/20 hover:border-white/60'}`}>
              {size}
            </button>
          ))}
        </div>
        <button type="button" onClick={q.add} disabled={!q.variant || q.status === 'adding'}
          className={`${display} press mt-3 h-11 w-full text-sm font-black disabled:bg-white/10 disabled:text-white/40`}
          style={q.variant ? { background: BALL } : undefined}>
          <span key={q.status} className={q.status === 'added' ? 'label-in inline-block' : undefined}>
            {q.status === 'added' ? '✓ Al vestuario' : q.status === 'adding' ? 'Añadiendo…' : q.variant ? `Añadir · ${formatPrice(q.price)}` : 'Elige talla'}
          </span>
        </button>
      </div>
    </article>
  )
}

export function BasketballPage({ slug, video, poster, initialProducts }: CategoryPageProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const { playing, toggle } = useLoopVideo(ref)
  const { data: products = [], isPending } = useCategoryProducts('Basketball', initialProducts)
  const shoes = products.filter(p => !isApparel(p))
  const kit = products.filter(isApparel)
  const f = categoryFigures(shoes)

  return (
    <div className={`${BLEED} relative overflow-hidden`}>
      <section aria-labelledby="hero-title" className={`${GUTTER} pt-10 pb-16`}>
        {/* Scoreboard: powers on when you walk into the arena */}
        <div className={`${display} board-on mx-auto grid max-w-3xl grid-cols-[1fr_auto_1fr] items-center gap-4 border-2 border-white/20 bg-black px-6 py-4 font-black`} aria-label="Marcador">
          <div className="text-left">
            <p className="text-xs font-bold text-white/50">Modelos</p>
            <p className="text-5xl tabular-nums" style={{ color: BALL }}>{String(f.models).padStart(2, '0')}</p>
          </div>
          <div className="border-x-2 border-white/15 px-6 text-center">
            <p className="text-xs font-bold text-white/50">Posesión</p>
            <p className="text-6xl text-[#ffd43b]" aria-hidden><ShotClock /></p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-white/50">Pares</p>
            <p className="text-5xl tabular-nums" style={{ color: BALL }}>{f.pairs}</p>
          </div>
        </div>

        <h1 id="hero-title" className={`${display} mt-10 text-center text-[clamp(4rem,14vw,12rem)] leading-[0.85] font-black`}>
          <span className="tipoff inline-block">Basket</span><span className="tipoff inline-block" style={{ color: BALL, '--d': '120ms' } as React.CSSProperties}>ball</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-white/60">
          Nacidas en la cancha, llevadas a la calle. Sujeción, tracción y siluetas que llevan décadas sin salir del partido.
        </p>

        {/* Jumbotron */}
        <div className="relative mx-auto mt-12 max-w-5xl border-[6px] border-black bg-black shadow-[0_0_0_2px_rgba(255,255,255,0.15)]">
          <video ref={ref} className="bg-video aspect-video w-full object-cover" style={{ objectPosition: 'center 55%' }}
            src={video} poster={poster} muted loop playsInline preload="metadata" aria-hidden />
          <button type="button" onClick={toggle} className={`${display} press absolute top-3 left-3 flex items-center gap-2 bg-black/70 px-2.5 py-1 text-xs font-bold`}
            aria-label={playing ? 'Pausar vídeo' : 'Reproducir vídeo'}>
            <span className={`size-2 rounded-full ${playing ? 'animate-pulse bg-red-500' : 'bg-white/40'}`} aria-hidden />
            {playing ? 'En directo' : 'Pausado'}
          </button>
        </div>
      </section>

      <section aria-labelledby="lineup-title" className={`${GUTTER} relative py-24`}>
        <CourtLines className="pointer-events-none absolute top-0 left-1/2 w-[min(900px,140%)] -translate-x-1/2 text-white/10" />
        <h2 id="lineup-title" className={`${display} relative text-center text-5xl font-black sm:text-6xl`}>
          {shoes.length > 1 ? 'Quinteto inicial' : 'El titular'}
        </h2>
        <p className="relative mt-2 text-center text-sm text-white/50">Dale la vuelta a la carta: stock real por talla y color, y fichaje directo.</p>
        <div className="relative mt-14 flex flex-wrap justify-center gap-10">
          {isPending && !products.length && (
            // Face-down card while the roster loads
            <div className="aspect-[5/7] w-full max-w-sm animate-pulse bg-[repeating-linear-gradient(45deg,#1b2230_0_12px,#10151f_12px_24px)] ring-2 ring-[#e8590c]/40" aria-hidden />
          )}
          {shoes.slice(0, 5).map(p => <PlayerCard key={p.id} product={p} />)}
        </div>
      </section>

      {kit.length > 0 && (
        <section aria-labelledby="locker-title" className={`${GUTTER} border-t border-white/10 py-20`}>
          <h2 id="locker-title" className={`${display} text-5xl font-black`}>Vestuario</h2>
          <p className="mt-2 text-sm text-white/50">La ropa del equipo, colgada en su taquilla.</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {kit.map((p, i) => <Locker key={p.id} product={p} n={i + 1} />)}
          </div>
        </section>
      )}

      <section aria-labelledby="playbook-title" className={`${GUTTER} border-t border-white/10 py-20`}>
        <h2 id="playbook-title" className={`${display} text-5xl font-black`}>Playbook</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {PLAYBOOK.map((play, i) => (
            <article key={play.title} className="scroll-in border-2 border-white/15 p-6">
              <svg viewBox="0 0 120 60" className="h-16 w-full" fill="none" aria-hidden>
                <rect x="1" y="1" width="118" height="58" stroke="rgba(255,255,255,0.2)" />
                <path d={play.play} stroke={BALL} strokeWidth="2.5" strokeDasharray="5 4" />
                <circle cx="10" cy={play.start} r="4" fill="white" />
                <text x="104" y="54" fill="rgba(255,255,255,0.5)" fontSize="9">X{i + 1}</text>
              </svg>
              <h3 className={`${display} mt-5 text-2xl font-black`}>{play.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{play.body}</p>
            </article>
          ))}
        </div>
      </section>

      <nav aria-label="Otras categorías" className={`${GUTTER} border-t border-white/10 py-12`}>
        <p className={`${display} text-sm font-bold text-white/40`}>Cambio</p>
        <OtherCategories slug={slug} className="mt-3 flex flex-wrap gap-3"
          linkClassName={`${display} press border-2 border-white/25 px-5 py-2 text-xl font-black hover:border-[#e8590c]`} />
      </nav>
    </div>
  )
}
