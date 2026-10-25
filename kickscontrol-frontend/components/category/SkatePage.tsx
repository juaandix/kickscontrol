'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { formatPrice } from '@/lib/sheet'
import { BLEED, GUTTER, ShoeImage, categoryFigures, useCategoryProducts, useLoopVideo } from './shared'
import { zineMarker } from './fonts'

const BLUE = '#2f6bff'
const marker = 'font-[family-name:var(--font-zine)]'

/** Photocopier grain: fractal noise as a tiled background. */
const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.18'/%3E%3C/svg%3E")`

/** Marker notes on the shoe, in percent of the photo box: label position, arrow start (clear of the text) and tip. */
const NOTES = [
  { text: 'Tobillo acolchado: no te machaca al caer', x: 8, y: 6, from: [20, 17], to: [32, 38] },
  { text: 'Ante en la puntera = aguanta el ollie', x: 66, y: 2, from: [74, 13], to: [82, 44] },
  { text: 'Suela vulcanizada, notas la tabla', x: 22, y: 88, from: [34, 85], to: [52, 72] },
]

const DICTIONARY = [
  ['Ollie', 'Saltar con la tabla pegada a los pies. Desgasta la puntera: por eso va reforzada.'],
  ['Board feel', 'Sentir la tabla a través de la suela. Cuanto más fina y flexible, más lo notas.'],
  ['Vulcanizada', 'Suela pegada al upper con calor. Flexible desde el primer día.'],
  ['Cupsole', 'Suela en forma de cubeta cosida. Más protección en saltos grandes, más duración.'],
]

/** A strip of masking tape holding the cut-outs down. */
function Tape({ className }: { className: string }) {
  return <span className={`absolute z-10 h-7 w-28 bg-[#e9dfc4]/85 shadow-sm ${className}`} aria-hidden />
}

/** VHS timecode counting up while the tape plays. Reduced motion holds it. */
function Timecode() {
  const [s, setS] = useState(754)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setS(v => v + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const p = (n: number) => String(n).padStart(2, '0')
  return <span className="tabular-nums">SP {p(Math.floor(s / 3600))}:{p(Math.floor(s / 60) % 60)}:{p(s % 60)}</span>
}

export function SkatePage({ video, poster }: { video: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useLoopVideo(ref)
  const { data: products = [] } = useCategoryProducts('Skateboarding')
  const f = categoryFigures(products)
  const hero = products[0]

  return (
    <div className={`${BLEED} ${zineMarker.variable} overflow-hidden bg-[#f4f3ee] text-[#111]`} style={{ backgroundImage: GRAIN }}>
      {/* Cover: the tape and the title scrawled over it */}
      <section aria-labelledby="hero-title" className={`${GUTTER} relative pt-12 pb-24`}>
        <p className="font-mono text-xs tracking-widest">KICKSCONTROL ZINE · Nº 1 · FOTOCOPIADO EN CASA</p>
        <div className="relative mx-auto mt-10 max-w-5xl">
          <Tape className="-top-3 left-8 -rotate-6" />
          <Tape className="-top-3 right-10 rotate-3" />
          <div className="relative rotate-[0.6deg] border-[10px] border-black bg-black">
            <video
              ref={ref}
              className="bg-video aspect-video w-full object-cover contrast-125 grayscale"
              style={{ objectPosition: 'center 65%' }}
              src={video}
              poster={poster}
              muted
              loop
              playsInline
              aria-hidden
            />
            {/* Scanlines and the VHS readout */}
            <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.25)_0_1px,transparent_1px_3px)]" aria-hidden />
            <div className="absolute inset-x-0 top-0 flex justify-between p-4 font-mono text-sm text-white" aria-hidden>
              <span>▶ PLAY</span>
              <Timecode />
            </div>
          </div>
          <h1
            id="hero-title"
            className={`${marker} absolute -bottom-14 left-1/2 w-max -translate-x-1/2 -rotate-3 text-[clamp(4rem,13vw,10rem)] leading-none`}
            style={{ color: BLUE, textShadow: '4px 4px 0 #111' }}
          >
            Skate
          </h1>
        </div>
        <p className={`${marker} mx-auto mt-24 max-w-xl rotate-1 text-center text-2xl`}>
          Agarre, board feel y que aguanten la lija. Lo demás es postureo.
        </p>
      </section>

      {/* The shoe, annotated by hand */}
      {hero && (
        <section aria-labelledby="anatomy-title" className={`${GUTTER} border-t-2 border-dashed border-black/40 py-20`}>
          <h2 id="anatomy-title" className={`${marker} -rotate-1 text-5xl`}>Anatomía de una skate shoe</h2>
          <Link href={`/products/${hero.id}`} className="group relative mx-auto mt-12 block max-w-4xl">
            <div className="relative isolate aspect-[16/10] bg-white">
              <ShoeImage product={hero} sizes="(max-width: 1024px) 100vw, 900px" pad="p-16" className="contrast-110" />
            </div>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 hidden h-full w-full md:block" aria-hidden>
              {NOTES.map(n => (
                <path
                  key={n.text}
                  d={`M ${n.from[0]} ${n.from[1]} Q ${(n.from[0] + n.to[0]) / 2 + 5} ${(n.from[1] + n.to[1]) / 2 - 4} ${n.to[0]} ${n.to[1]}`}
                  fill="none"
                  stroke={BLUE}
                  strokeWidth="2.5"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
            {NOTES.map((n, i) => (
              <span
                key={n.text}
                className={`${marker} absolute hidden max-w-56 text-lg leading-tight md:block`}
                style={{ left: `${n.x}%`, top: `${n.y}%`, color: BLUE, rotate: `${i % 2 ? 2 : -2}deg` }}
              >
                {n.text}
              </span>
            ))}
            <ul className={`${marker} mt-6 space-y-2 text-lg md:hidden`} style={{ color: BLUE }}>
              {NOTES.map(n => <li key={n.text}>→ {n.text}</li>)}
            </ul>
          </Link>
        </section>
      )}

      {/* Stickers: every shoe in the category */}
      <section aria-labelledby="stickers-title" className={`${GUTTER} border-t-2 border-dashed border-black/40 py-20`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="stickers-title" className={`${marker} rotate-1 text-5xl`}>Pegatinas</h2>
          <p className="font-mono text-xs">{f.models} MODELO{f.models === 1 ? '' : 'S'} · {f.pairs} PARES EN STOCK · DESDE {formatPrice(f.from)}</p>
        </div>
        <div className="mt-12 flex flex-wrap gap-12">
          {products.map((p, i) => (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className="press relative block w-72 bg-white p-3 shadow-[6px_6px_0_#111]"
              style={{ rotate: `${[-4, 3, -2, 5][i % 4]}deg` }}
            >
              <Tape className="-top-4 left-1/2 -translate-x-1/2 rotate-2" />
              <div className="relative isolate aspect-square bg-white">
                <ShoeImage product={p} sizes="288px" />
              </div>
              <p className={`${marker} mt-2 text-2xl leading-none`}>{p.name}</p>
              <p className="mt-1 flex justify-between font-mono text-xs">
                <span>{p.brand}</span>
                <span className="px-1.5 py-0.5 text-white" style={{ background: BLUE }}>{formatPrice(p.basePrice)}</span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Glossary, typed out */}
      <section aria-labelledby="dict-title" className={`${GUTTER} border-t-2 border-dashed border-black/40 py-20`}>
        <h2 id="dict-title" className={`${marker} -rotate-1 text-5xl`}>Diccionario</h2>
        <dl className="mt-10 grid gap-6 sm:grid-cols-2">
          {DICTIONARY.map(([term, def], i) => (
            <div key={term} className="scroll-in border-2 border-black bg-white p-5 font-mono text-sm" style={{ rotate: `${i % 2 ? 0.8 : -0.8}deg` }}>
              <dt className={`${marker} text-2xl`} style={{ color: BLUE }}>{term}</dt>
              <dd className="mt-2 leading-relaxed">{def}</dd>
            </div>
          ))}
        </dl>
      </section>

      <nav aria-label="Otras categorías" className={`${GUTTER} border-t-2 border-dashed border-black/40 py-14`}>
        <p className="font-mono text-xs">MÁS SPOTS →</p>
        <div className="mt-5 flex flex-wrap gap-5">
          {[['running', 'Running'], ['basketball', 'Basketball'], ['lifestyle', 'Lifestyle']].map(([slug, name], i) => (
            <Link
              key={slug}
              href={`/categoria/${slug}`}
              className={`${marker} press inline-block bg-black px-5 py-2 text-2xl text-white`}
              style={{ rotate: `${[-3, 2, -1][i]}deg` }}
            >
              {name}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
