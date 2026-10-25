'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { formatPrice } from '@/lib/sheet'
import { BLEED, GUTTER, ShoeImage, categoryFigures, useCategoryProducts, useLoopVideo } from './shared'
import { editorialSerif } from './fonts'

const PAPER = '#f3ede3'
const INK = '#1d1a16'
const serif = 'font-[family-name:var(--font-editorial)]'

/** Lookbook rhythm: which looks run large, so the spread never reads as a uniform grid. */
const SPANS = [
  { cell: 'md:col-span-7 md:row-span-2', frame: 'aspect-[4/5]' },
  { cell: 'md:col-span-5', frame: 'aspect-[4/3]' },
  { cell: 'md:col-span-5', frame: 'aspect-[4/3]' },
  { cell: 'md:col-span-4', frame: 'aspect-square' },
  { cell: 'md:col-span-4 md:mt-16', frame: 'aspect-square' },
  { cell: 'md:col-span-4', frame: 'aspect-square' },
]

export function LifestylePage({ video, poster }: { video: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useLoopVideo(ref)
  const { data: products = [] } = useCategoryProducts('Lifestyle')
  const f = categoryFigures(products)
  const cover = products.find(p => p.name.includes('2002R')) ?? products[0]
  const issue = `Nº ${String(new Date().getMonth() + 1).padStart(2, '0')}`

  return (
    <div className={`${BLEED} ${editorialSerif.variable}`} style={{ background: PAPER, color: INK }}>
      {/* Cover */}
      <section aria-labelledby="hero-title" className={`${GUTTER} pt-8 pb-20`}>
        <div className="flex items-baseline justify-between border-b pb-3 text-xs tracking-[0.2em] uppercase" style={{ borderColor: INK }}>
          <span>{issue} · Otoño</span>
          <span>Edición Lifestyle</span>
          <span className="hidden sm:inline">{f.models} siluetas</span>
        </div>
        <h1 id="hero-title" className={`${serif} mt-2 text-center text-[clamp(5rem,19vw,17rem)] leading-[0.8] tracking-[-0.03em]`}>
          Lifestyle
        </h1>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-12">
          <ul className={`${serif} order-2 space-y-8 text-2xl leading-tight lg:order-1 lg:col-span-3`}>
            <li><span className="italic">Diez siluetas</span> para todos los días</li>
            <li>Blanco con todo: <span className="italic">la regla que nunca falla</span></li>
          </ul>
          <div className="order-1 lg:order-2 lg:col-span-6">
            <video
              ref={ref}
              className="bg-video aspect-[4/5] w-full object-cover"
              style={{ objectPosition: 'center 70%' }}
              src={video}
              poster={poster}
              muted
              loop
              playsInline
              aria-hidden
            />
          </div>
          <ul className={`${serif} order-3 space-y-8 text-2xl leading-tight lg:col-span-3 lg:text-right`}>
            {cover && <li>El icono de la temporada: <span className="italic">{cover.name}</span></li>}
            <li><span className="italic">Desde {formatPrice(f.from)}</span>, con stock real</li>
          </ul>
        </div>
      </section>

      {/* Editor's letter */}
      <section aria-labelledby="letter-title" className={`${GUTTER} border-t py-20`} style={{ borderColor: `${INK}33` }}>
        <h2 id="letter-title" className="text-xs tracking-[0.2em] uppercase">Carta de la editora</h2>
        <div className="mt-8 gap-12 text-lg leading-relaxed md:columns-2">
          <p className={`${serif} first-letter:float-left first-letter:mr-3 first-letter:text-[5.5rem] first-letter:leading-[0.8]`}>
            Hay zapatillas que no se eligen: se repiten. Las que te pones sin mirar el tiempo, las que van con el traje y con el chándal, las que acaban siendo parte de cómo te reconocen.
          </p>
          <p className={`${serif} mt-6 md:mt-0`}>
            En esta edición reunimos {f.models} siluetas de {f.brands} marcas: iconos de archivo, reediciones y los básicos que nunca deberían faltar. Cada una con su stock real por talla, para que lo que te guste esté en tu número.
          </p>
        </div>
      </section>

      {/* Lookbook */}
      <section aria-labelledby="looks-title" className={`${GUTTER} pb-24`}>
        <div className="flex items-baseline justify-between border-b pb-3" style={{ borderColor: INK }}>
          <h2 id="looks-title" className={`${serif} text-5xl italic`}>Lookbook</h2>
          <span className="text-xs tracking-[0.2em] uppercase">{products.length} looks</span>
        </div>
        <div className="mt-10 grid gap-x-6 gap-y-12 md:grid-cols-12">
          {products.map((product, i) => (
            <Link key={product.id} href={`/products/${product.id}`} className={`group scroll-in block ${SPANS[i % SPANS.length].cell}`}>
              <div className={`relative isolate overflow-hidden ${SPANS[i % SPANS.length].frame}`} style={{ background: '#e8dfd1' }}>
                <ShoeImage product={product} sizes="(max-width: 768px) 100vw, 50vw" pad="p-10" className="transition-transform duration-700 group-hover:scale-[1.03]" />
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-4">
                <p className={`${serif} text-xl`}>
                  <span className="italic">Look {String(i + 1).padStart(2, '0')}</span> — {product.name}
                </p>
                <p className="shrink-0 text-sm">{formatPrice(product.basePrice)}</p>
              </div>
              <p className="text-xs tracking-[0.15em] uppercase opacity-60">{product.brand}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Pull quote */}
      <section className={`${GUTTER} border-y py-24 text-center`} style={{ borderColor: `${INK}33` }}>
        <blockquote className={`${serif} mx-auto max-w-4xl text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.05] italic`}>
          “Blanco con todo, ante para el otoño, color con lo neutro. Y si dudas, la que más se repite en tu armario.”
        </blockquote>
        <p className="mt-6 text-xs tracking-[0.2em] uppercase">Guía de estilo</p>
      </section>

      {/* Contents */}
      <nav aria-label="Otras categorías" className={`${GUTTER} py-16`}>
        <p className="text-xs tracking-[0.2em] uppercase">Índice</p>
        <ol className={`${serif} mt-6 max-w-2xl text-3xl`}>
          {[['running', 'Running', 12], ['basketball', 'Basketball', 24], ['skateboarding', 'Skateboarding', 36]].map(([slug, name, page]) => (
            <li key={slug}>
              <Link href={`/categoria/${slug}`} className="group flex items-baseline gap-3 py-2">
                <span className="group-hover:italic">{name}</span>
                <span className="flex-1 border-b border-dotted" style={{ borderColor: INK }} />
                <span className="text-xl tabular-nums">{page}</span>
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}
