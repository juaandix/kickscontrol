'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { formatPrice, hasBackdrop, isApparel } from '@/lib/sheet'
import type { Product } from '@/types'
import {
  BLEED, GUTTER, OtherCategories, ShoeImage, categoryFigures, useCategoryProducts, useLoopVideo, useQuickAdd,
  type CategoryPageProps,
} from './shared'

const BLUE = '#2f6bff'
const marker = 'font-[family-name:var(--font-zine)]'

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
  return <span className={`tape absolute z-10 h-7 w-28 bg-[#e9dfc4]/85 shadow-sm ${className}`} aria-hidden />
}

/** VHS timecode: only runs while the tape plays. */
function Timecode({ running }: { running: boolean }) {
  const [s, setS] = useState(754)
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setS(v => v + 1), 1000)
    return () => clearInterval(id)
  }, [running])
  const p = (n: number) => String(n).padStart(2, '0')
  return <span className="tabular-nums">SP {p(Math.floor(s / 3600))}:{p(Math.floor(s / 60) % 60)}:{p(s % 60)}</span>
}

/** A shoe as a sticker: lifts off the page on hover, and its price tag opens the sizes to stick it in the cart. */
function Sticker({ product, tilt }: { product: Product; tilt: number }) {
  const q = useQuickAdd(product)
  const [open, setOpen] = useState(false)
  return (
    <div className="sticker relative w-72 bg-white p-3 shadow-[6px_6px_0_#111]" style={{ rotate: `${tilt}deg` }}>
      <Tape className="-top-4 left-1/2 -translate-x-1/2 rotate-2" />
      <Link href={`/products/${product.id}`} className="relative isolate block aspect-square bg-white">
        <ShoeImage product={product} sizes="288px" />
      </Link>
      <Link href={`/products/${product.id}`} className={`${marker} mt-2 block text-2xl leading-none hover:underline`}>{product.name}</Link>
      <div className="mt-1 flex items-center justify-between font-mono text-xs">
        <span>{product.brand}</span>
        {q.colors.length > 0 ? (
          <button type="button" aria-expanded={open} onClick={() => setOpen(o => !o)} className="press px-1.5 py-0.5 text-white" style={{ background: BLUE }}>
            {formatPrice(q.price)} {open ? '×' : '+'}
          </button>
        ) : <span className="line-through">AGOTADA</span>}
      </div>
      {open && (
        <div className="label-in mt-3 border-t-2 border-dashed border-black/30 pt-3">
          {q.colors.length > 1 && (
            <div className="mb-2 flex flex-wrap gap-1" role="radiogroup" aria-label="Color">
              {q.colors.map(c => (
                <button key={c} type="button" role="radio" aria-checked={q.color === c} onClick={() => q.setColor(c)}
                  className={`press border-2 px-1.5 font-mono text-[0.6875rem] ${q.color === c ? 'border-black bg-black text-white' : 'border-black/30'}`}>
                  {c}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Talla">
            {q.sizes.map(({ size, stock }) => (
              <button key={size} type="button" role="radio" aria-checked={q.size === size} disabled={stock === 0} onClick={() => q.setSize(size)}
                className={`press size-9 border-2 font-mono text-xs disabled:opacity-25 disabled:line-through ${q.size === size ? 'border-black bg-black text-white' : 'border-black/30 hover:border-black'}`}>
                {size}
              </button>
            ))}
          </div>
          <button type="button" onClick={q.add} disabled={!q.variant || q.status === 'adding'}
            className={`${marker} press mt-3 h-11 w-full text-lg text-white disabled:bg-black/20`} style={q.variant ? { background: BLUE } : undefined}>
            <span key={q.status} className={q.status === 'added' ? 'label-in inline-block' : undefined}>
              {q.status === 'added' ? '¡Pegada al carrito!' : q.status === 'adding' ? 'Pegando…' : q.variant ? 'Al carrito' : 'Elige talla'}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

export function SkatePage({ slug, video, poster, initialProducts }: CategoryPageProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const { playing, toggle } = useLoopVideo(ref)
  const { data: products = [], isPending } = useCategoryProducts('Skateboarding', initialProducts)
  const shoes = products.filter(p => !isApparel(p))
  const merch = products.filter(isApparel)
  const f = categoryFigures(shoes)
  // The marker notes are drawn for a side-on cut-out, so annotate a studio shot, not a street photo
  const hero = shoes.find(p => p.imageUrl && !hasBackdrop(p.imageUrl))

  return (
    <div className={`${BLEED} overflow-hidden text-[#111]`}>
      {/* Cover: the tape and the title scrawled over it */}
      <section aria-labelledby="hero-title" className={`${GUTTER} relative pt-12 pb-24`}>
        <p className="font-mono text-xs tracking-widest">KICKSCONTROL ZINE · Nº 1 · FOTOCOPIADO EN CASA</p>
        <div className="relative mx-auto mt-10 max-w-5xl">
          <Tape className="-top-3 left-8 -rotate-6" />
          <Tape className="-top-3 right-10 rotate-3" />
          <div className="relative rotate-[0.6deg] border-[10px] border-black bg-black">
            <video ref={ref} className="bg-video aspect-video w-full object-cover contrast-125 grayscale" style={{ objectPosition: 'center 65%' }}
              src={video} poster={poster} muted loop playsInline preload="metadata" aria-hidden />
            {/* Scanlines and the VHS readout */}
            <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.25)_0_1px,transparent_1px_3px)]" aria-hidden />
            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4 font-mono text-sm text-white">
              <button type="button" onClick={toggle} className="press bg-black/40 px-2 py-0.5 hover:bg-black/70" aria-label={playing ? 'Pausar vídeo' : 'Reproducir vídeo'}>
                {playing ? '❚❚ PAUSE' : '▶ PLAY'}
              </button>
              <span aria-hidden><Timecode running={playing} /></span>
            </div>
          </div>
          <h1 id="hero-title" className="absolute -bottom-14 left-1/2 w-max -translate-x-1/2">
            <span className={`${marker} slap block -rotate-3 text-[clamp(4rem,13vw,10rem)] leading-none`} style={{ color: BLUE, textShadow: '4px 4px 0 #111' }}>
              Skate
            </span>
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
          <figure className="mx-auto mt-12 max-w-4xl">
            <Link href={`/products/${hero.id}`} className="relative block">
              <div className="relative isolate aspect-[16/10] bg-white">
                <ShoeImage product={hero} sizes="(max-width: 1024px) 100vw, 900px" pad="p-10 md:p-16" className="contrast-110" />
              </div>
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 hidden h-full w-full md:block" aria-hidden>
                {NOTES.map(n => (
                  <path key={n.text} d={`M ${n.from[0]} ${n.from[1]} Q ${(n.from[0] + n.to[0]) / 2 + 5} ${(n.from[1] + n.to[1]) / 2 - 4} ${n.to[0]} ${n.to[1]}`}
                    fill="none" stroke={BLUE} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                ))}
              </svg>
              {NOTES.map((n, i) => (
                <span key={n.text} className={`${marker} absolute hidden max-w-56 text-lg leading-tight md:block`}
                  style={{ left: `${n.x}%`, top: `${n.y}%`, color: BLUE, rotate: `${i % 2 ? 2 : -2}deg` }}>
                  {n.text}
                </span>
              ))}
              {/* On phones the notes become numbered marks on the shoe, with the legend below */}
              {NOTES.map((n, i) => (
                <span key={n.text} className={`${marker} absolute grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-sm text-white md:hidden`}
                  style={{ left: `${n.to[0]}%`, top: `${n.to[1]}%`, background: BLUE }} aria-hidden>
                  {i + 1}
                </span>
              ))}
            </Link>
            <figcaption>
              <ol className={`${marker} mt-6 space-y-2 text-lg md:hidden`} style={{ color: BLUE }}>
                {NOTES.map((n, i) => <li key={n.text}>{i + 1}. {n.text}</li>)}
              </ol>
            </figcaption>
          </figure>
        </section>
      )}

      {/* Stickers: every shoe in the category */}
      <section aria-labelledby="stickers-title" className={`${GUTTER} border-t-2 border-dashed border-black/40 py-20`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="stickers-title" className={`${marker} rotate-1 text-5xl`}>Pegatinas</h2>
          <p className="font-mono text-xs">{f.models} MODELO{f.models === 1 ? '' : 'S'} · {f.pairs} PARES EN STOCK · DESDE {formatPrice(f.from)}</p>
        </div>
        <p className="mt-3 font-mono text-xs text-black/60">Pulsa el precio para elegir talla y pegarla al carrito.</p>
        <div className="mt-12 flex flex-wrap items-start gap-12">
          {isPending && !products.length && (
            <div className="aspect-[4/5] w-72 -rotate-3 border-4 border-dashed border-black/30" aria-hidden />
          )}
          {shoes.map((p, i) => <Sticker key={p.id} product={p} tilt={[-4, 3, -2, 5][i % 4]} />)}
        </div>
      </section>

      {merch.length > 0 && (
        <section aria-labelledby="merch-title" className={`${GUTTER} border-t-2 border-dashed border-black/40 py-20`}>
          <h2 id="merch-title" className={`${marker} -rotate-1 text-5xl`}>Merch</h2>
          <p className="mt-3 font-mono text-xs text-black/60">ROPA PARA PATINAR · AGUANTA CAÍDAS Y LAVADOS</p>
          <div className="mt-12 flex flex-wrap items-start gap-12">
            {merch.map((p, i) => <Sticker key={p.id} product={p} tilt={[3, -3, 2, -5][i % 4]} />)}
          </div>
        </section>
      )}

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
        <OtherCategories slug={slug} className="mt-5 flex flex-wrap gap-5"
          linkClassName={i => `${marker} press inline-block bg-black px-5 py-2 text-2xl text-white ${['-rotate-3', 'rotate-2', '-rotate-1'][i % 3]}`} />
      </nav>
    </div>
  )
}
