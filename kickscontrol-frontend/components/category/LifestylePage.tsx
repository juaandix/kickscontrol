'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { formatPrice, isApparel } from '@/lib/sheet'
import type { Product } from '@/types'
import { Swatch } from '@/components/catalog/Swatch'
import {
  BLEED, GUTTER, OtherCategories, ShoeImage, categoryFigures, flagship, toneFamily, useCategoryProducts, useLoopVideo, useQuickAdd,
  type CategoryPageProps,
} from './shared'

const serif = 'font-[family-name:var(--font-editorial)]'
const TONES = ['Todas', 'Claras', 'Oscuras', 'Neutras', 'Color'] as const

/** Lookbook rhythm, so the spread never reads as a uniform grid. On phones every third look runs full width. */
const SPANS = [
  { cell: 'col-span-2 md:col-span-7 md:row-span-2', frame: 'aspect-[4/5]' },
  { cell: 'md:col-span-5', frame: 'aspect-[4/5] md:aspect-[4/3]' },
  { cell: 'md:col-span-5', frame: 'aspect-[4/5] md:aspect-[4/3]' },
  { cell: 'col-span-2 md:col-span-4', frame: 'aspect-[4/3] md:aspect-square' },
  { cell: 'md:col-span-4 md:mt-16', frame: 'aspect-[4/5] md:aspect-square' },
  { cell: 'md:col-span-4', frame: 'aspect-[4/5] md:aspect-square' },
]

const NUMBERS = ['Cero', 'Una', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve', 'Diez', 'Once', 'Doce']
const countWord = (n: number) => NUMBERS[n] ?? String(n)

function season(month: number) {
  return ['Invierno', 'Invierno', 'Primavera', 'Primavera', 'Primavera', 'Verano', 'Verano', 'Verano', 'Otoño', 'Otoño', 'Otoño', 'Invierno'][month]
}

/** A look's caption: its colourways as swatches, and "shop the look" opening the sizes underneath. */
function LookCaption({ product, n }: { product: Product; n: number }) {
  const q = useQuickAdd(product)
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-3">
      <div className="flex items-baseline justify-between gap-4">
        <Link href={`/products/${product.id}`} className={`${serif} text-xl hover:italic`}>
          <span className="italic">Look {String(n).padStart(2, '0')}</span> — {product.name}
        </Link>
        <p className="shrink-0 text-sm tabular-nums">{formatPrice(q.price)}</p>
      </div>
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="text-xs tracking-[0.15em] uppercase opacity-60">{product.brand}</p>
        <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Color">
          {q.colors.map(c => (
            <button key={c} type="button" role="radio" aria-checked={q.color === c} aria-label={c} title={c} onClick={() => q.setColor(c)}
              className={`press rounded-full p-0.5 ring-1 ${q.color === c ? 'ring-[#1d1a16]' : 'ring-transparent hover:ring-[#1d1a16]/30'}`}>
              <Swatch color={c} className="size-3.5 rounded-full" />
            </button>
          ))}
        </div>
      </div>
      {q.colors.length > 0 && (
        <button type="button" aria-expanded={open} onClick={() => setOpen(o => !o)} className={`${serif} mt-2 text-base italic underline-offset-4 hover:underline`}>
          {open ? 'Cerrar' : 'Comprar el look'}
        </button>
      )}
      {open && (
        <div className="label-in mt-3 border-t border-[#1d1a16]/20 pt-3">
          <p className="text-xs tracking-[0.15em] uppercase opacity-60">{q.color} · elige talla</p>
          <div className="mt-2 flex flex-wrap gap-1" role="radiogroup" aria-label="Talla">
            {q.sizes.map(({ size, stock }) => (
              <button key={size} type="button" role="radio" aria-checked={q.size === size} disabled={stock === 0} onClick={() => q.setSize(size)}
                className={`press h-9 min-w-10 border px-1 text-sm tabular-nums disabled:opacity-30 disabled:line-through ${q.size === size ? 'border-[#1d1a16] bg-[#1d1a16] text-[#f3ede3]' : 'border-[#1d1a16]/25 hover:border-[#1d1a16]'}`}>
                {size}
              </button>
            ))}
          </div>
          <button type="button" onClick={q.add} disabled={!q.variant || q.status === 'adding'}
            className={`${serif} press mt-3 h-11 w-full bg-[#1d1a16] text-lg text-[#f3ede3] italic disabled:opacity-40`}>
            <span key={q.status} className={q.status === 'added' ? 'label-in inline-block' : undefined}>
              {q.status === 'added' ? 'Añadido a tu bolsa' : q.status === 'adding' ? 'Añadiendo…' : q.variant ? 'Añadir a la bolsa' : 'Elige una talla'}
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

export function LifestylePage({ slug, video, poster, initialProducts }: CategoryPageProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const { playing, toggle } = useLoopVideo(ref)
  const { data: products = [], isPending } = useCategoryProducts('Lifestyle', initialProducts)
  const [tone, setTone] = useState<(typeof TONES)[number]>('Todas')
  const shoes = products.filter(p => !isApparel(p))
  const garments = products.length - shoes.length
  const f = categoryFigures(shoes)
  const cover = flagship(shoes)
  const now = new Date()
  const issue = `Nº ${String(now.getMonth() + 1).padStart(2, '0')} · ${season(now.getMonth())} ${now.getFullYear()}`

  // A look belongs to a tone when any colourway in stock does
  const inTone = (p: Product) => tone === 'Todas' || p.variants.some(v => v.stockQuantity > 0 && toneFamily(v.color) === tone)
  const looks = products.filter(inTone)
  const toneCount = (t: (typeof TONES)[number]) => t === 'Todas' ? products.length
    : products.filter(p => p.variants.some(v => v.stockQuantity > 0 && toneFamily(v.color) === t)).length

  return (
    <div className={`${BLEED}`}>
      {/* Cover */}
      <section aria-labelledby="hero-title" className={`${GUTTER} pt-8 pb-20`}>
        <div className="flex items-baseline justify-between border-b border-[#1d1a16] pb-3 text-xs tracking-[0.2em] uppercase">
          <span>{issue}</span>
          <span className="hidden sm:inline">Edición Lifestyle</span>
          <span>{f.models} siluetas{garments > 0 && ` · ${garments} prendas`}</span>
        </div>
        <h1 id="hero-title" className={`${serif} masthead-print mt-2 text-center text-[clamp(5rem,19vw,17rem)] leading-[0.8] tracking-[-0.03em]`}>
          Lifestyle
        </h1>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-12">
          <ul className={`${serif} order-2 space-y-8 text-2xl leading-tight lg:order-1 lg:col-span-3`}>
            <li><span className="italic">{countWord(f.models)} siluetas</span> para todos los días</li>
            {garments > 0
              ? <li>Y para vestirlas: <span className="italic">{countWord(garments).toLowerCase()} prendas</span> de diario</li>
              : <li>Blanco con todo: <span className="italic">la regla que nunca falla</span></li>}
          </ul>
          <figure className="cover-reveal order-1 lg:order-2 lg:col-span-6">
            <video ref={ref} className="bg-video aspect-[4/5] w-full object-cover" style={{ objectPosition: 'center 70%' }}
              src={video} poster={poster} muted loop playsInline preload="metadata" aria-hidden />
            <figcaption className="mt-2 flex justify-between text-xs tracking-[0.15em] uppercase">
              <span>En portada: la calle</span>
              <button type="button" onClick={toggle} className={`${serif} text-sm tracking-normal normal-case italic underline-offset-4 hover:underline`}>
                {playing ? 'Pausar' : 'Reproducir'}
              </button>
            </figcaption>
          </figure>
          <ul className={`${serif} order-3 space-y-8 text-2xl leading-tight lg:col-span-3 lg:text-right`}>
            {cover && <li>El icono de la edición: <Link href={`/products/${cover.id}`} className="italic hover:underline">{cover.name}</Link></li>}
            {f.models > 0 && <li><span className="italic">Desde {formatPrice(f.from)}</span>, con stock real</li>}
          </ul>
        </div>
      </section>

      {/* Editor's letter */}
      <section aria-labelledby="letter-title" className={`${GUTTER} border-t border-[#1d1a16]/20 py-20`}>
        <h2 id="letter-title" className="text-xs tracking-[0.2em] uppercase">Carta de la editora</h2>
        <div className="mt-8 gap-12 text-lg leading-relaxed md:columns-2">
          <p className={`${serif} first-letter:float-left first-letter:mr-3 first-letter:text-[5.5rem] first-letter:leading-[0.8]`}>
            Hay zapatillas que no se eligen: se repiten. Las que te pones sin mirar el tiempo, las que van con el traje y con el chándal, las que acaban siendo parte de cómo te reconocen.
          </p>
          <p className={`${serif} mt-6 md:mt-0`}>
            En esta edición reunimos {countWord(f.models).toLowerCase()} siluetas de {f.brands} marcas: iconos de archivo, reediciones y los básicos que nunca deberían faltar{garments > 0 && `, más ${countWord(garments).toLowerCase()} prendas para llevarlas`}. Cada pieza con su stock real por talla, para que lo que te guste esté en tu número.
          </p>
        </div>
      </section>

      {/* Lookbook */}
      <section aria-labelledby="looks-title" className={`${GUTTER} pb-24`}>
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#1d1a16] pb-3">
          <h2 id="looks-title" className={`${serif} text-5xl italic`}>Lookbook</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs tracking-[0.15em] uppercase" role="radiogroup" aria-label="Filtrar por tono">
            {TONES.map(t => (
              <button key={t} type="button" role="radio" aria-checked={tone === t} onClick={() => setTone(t)} disabled={toneCount(t) === 0}
                className={`press py-1 underline-offset-4 disabled:opacity-30 ${tone === t ? 'underline decoration-2' : 'opacity-60 hover:opacity-100'}`}>
                {t} <span className="tabular-nums">({toneCount(t)})</span>
              </button>
            ))}
          </div>
        </div>
        <div key={tone} className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-12 md:gap-x-6">
          {isPending && !products.length && SPANS.map((s, i) => (
            <div key={i} className={`${s.cell} ${s.frame} animate-pulse bg-[#e8dfd1]`} aria-hidden />
          ))}
          {looks.map((product, i) => {
            const span = SPANS[i % SPANS.length]
            return (
              <article key={product.id} className={`card-in ${span.cell}`} style={{ '--d': `${Math.min(i, 6) * 50}ms` } as React.CSSProperties}>
                <Link href={`/products/${product.id}`} className={`group relative isolate block overflow-hidden bg-[#e8dfd1] ${span.frame}`}>
                  <ShoeImage product={product} sizes="(max-width: 768px) 50vw, 50vw" pad="p-6 md:p-10" className="transition-transform duration-700 group-hover:scale-[1.03]" />
                </Link>
                <LookCaption product={product} n={products.indexOf(product) + 1} />
              </article>
            )
          })}
        </div>
      </section>

      {/* Pull quote */}
      <section className={`${GUTTER} border-y border-[#1d1a16]/20 py-24 text-center`}>
        <blockquote className={`${serif} mx-auto max-w-4xl text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.05] italic`}>
          “Blanco con todo, ante para el otoño, color con lo neutro. Y si dudas, la que más se repite en tu armario.”
        </blockquote>
        <p className="mt-6 text-xs tracking-[0.2em] uppercase">Guía de estilo</p>
      </section>

      {/* Contents */}
      <nav aria-label="Otras categorías" className={`${GUTTER} py-16`}>
        <p className="text-xs tracking-[0.2em] uppercase">Índice</p>
        <OtherCategories slug={slug} className={`${serif} mt-6 flex max-w-2xl flex-col text-3xl`} linkClassName="group flex items-baseline gap-3 py-2"
          render={(title, i) => (
            <>
              <span className="group-hover:italic">{title}</span>
              <span className="flex-1 border-b border-dotted border-[#1d1a16]" />
              <span className="text-xl tabular-nums">{(i + 1) * 12}</span>
            </>
          )} />
      </nav>
    </div>
  )
}
