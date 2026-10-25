'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { fetchProduct } from '@/lib/products'
import { formatPrice } from '@/lib/sheet'
import type { Product } from '@/types'
import { BLEED, GUTTER, ShoeImage, categoryFigures, useCategoryProducts, useLoopVideo } from './shared'
import { courtDisplay } from './fonts'

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

/** A trading card for the shoe: number, photo and its real stats from the warehouse. */
function PlayerCard({ product, detail, n }: { product: Product; detail?: Product; n: number }) {
  const variants = detail?.variants ?? []
  const stats = [
    ['Tallas', variants.length ? new Set(variants.map(v => v.size)).size : '—'],
    ['Colores', variants.length ? new Set(variants.map(v => v.color)).size : '—'],
    ['Stock', product.totalStock ?? '—'],
    ['Precio', formatPrice(product.basePrice)],
  ]
  return (
    <Link href={`/products/${product.id}`} className="group block w-full max-w-sm -rotate-1 bg-[#f6efe6] p-3 text-[#10151f] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:rotate-0">
      <div className="relative isolate aspect-[4/5] overflow-hidden" style={{ background: `linear-gradient(160deg, ${BALL}, #ff922b)` }}>
        <span className={`${display} absolute top-2 left-3 z-10 text-7xl font-black text-white/90 [text-shadow:0_2px_12px_rgba(0,0,0,0.35)]`}>#{String(n).padStart(2, '0')}</span>
        <ShoeImage product={product} sizes="384px" pad="p-8" className="transition-transform duration-500 group-hover:scale-105" />
        <span className={`${display} absolute right-3 bottom-2 z-10 text-sm font-bold text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.4)]`}>{product.brand}</span>
      </div>
      <p className={`${display} mt-3 text-3xl leading-none font-black`}>{product.name}</p>
      <dl className="mt-3 grid grid-cols-4 border-t-2 border-[#10151f] pt-2 text-center">
        {stats.map(([k, v]) => (
          <div key={k}>
            <dt className={`${display} text-[0.625rem] font-bold text-[#10151f]/60`}>{k}</dt>
            <dd className={`${display} text-lg font-black`}>{v}</dd>
          </div>
        ))}
      </dl>
    </Link>
  )
}

export function BasketballPage({ video, poster }: { video: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useLoopVideo(ref)
  const { data: products = [] } = useCategoryProducts('Basketball')
  const details = useQueries({ queries: products.map(p => ({ queryKey: ['product', p.id], queryFn: () => fetchProduct(p.id) })) })
  const f = categoryFigures(products)

  return (
    <div className={`${BLEED} ${courtDisplay.variable} relative overflow-hidden bg-[#10151f] text-white`} style={{ colorScheme: 'dark' }}>
      <section aria-labelledby="hero-title" className={`${GUTTER} pt-10 pb-16`}>
        {/* Scoreboard */}
        <div className={`${display} mx-auto grid max-w-3xl grid-cols-[1fr_auto_1fr] items-center gap-4 border-2 border-white/20 bg-black px-6 py-4 font-black`} aria-label="Marcador">
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
          Basket<span style={{ color: BALL }}>ball</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-white/60">
          Nacidas en la cancha, llevadas a la calle. Sujeción, tracción y siluetas que llevan décadas sin salir del partido.
        </p>

        {/* Jumbotron */}
        <div className="relative mx-auto mt-12 max-w-5xl border-[6px] border-black bg-black shadow-[0_0_0_2px_rgba(255,255,255,0.15)]">
          <video
            ref={ref}
            className="bg-video aspect-video w-full object-cover"
            style={{ objectPosition: 'center 55%' }}
            src={video}
            poster={poster}
            muted
            loop
            playsInline
            aria-hidden
          />
          <span className={`${display} absolute top-3 left-3 flex items-center gap-2 bg-black/70 px-2.5 py-1 text-xs font-bold`}>
            <span className="size-2 animate-pulse rounded-full bg-red-500" aria-hidden /> En directo
          </span>
        </div>
      </section>

      <section aria-labelledby="lineup-title" className={`${GUTTER} relative py-24`}>
        <CourtLines className="pointer-events-none absolute top-0 left-1/2 w-[min(900px,140%)] -translate-x-1/2 text-white/10" />
        <h2 id="lineup-title" className={`${display} relative text-center text-5xl font-black sm:text-6xl`}>
          {products.length > 1 ? 'Quinteto inicial' : 'El titular'}
        </h2>
        <p className="relative mt-2 text-center text-sm text-white/50">Las estadísticas salen del almacén, en tiempo real.</p>
        <div className="relative mt-14 flex flex-wrap justify-center gap-10">
          {products.slice(0, 5).map((p, i) => (
            <PlayerCard key={p.id} product={p} detail={details[i]?.data} n={p.id} />
          ))}
        </div>
      </section>

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
        <div className="mt-3 flex flex-wrap gap-3">
          {[['running', 'Running'], ['lifestyle', 'Lifestyle'], ['skateboarding', 'Skateboarding']].map(([slug, name]) => (
            <Link key={slug} href={`/categoria/${slug}`} className={`${display} press border-2 border-white/25 px-5 py-2 text-xl font-black hover:border-[#e8590c]`}>
              {name}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
