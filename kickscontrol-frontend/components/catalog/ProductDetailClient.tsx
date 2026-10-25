'use client'

import Link from 'next/link'
import { categoryHref } from '@/lib/categories'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeftIcon } from '@heroicons/react/20/solid'
import { FloatingShoe } from '@/components/motion/FloatingShoe'
import { fetchProduct } from '@/lib/products'
import { StyleOrder } from './StyleOrder'

interface Props {
  id: number
}

/** A style's own page: the full entry of the sheet, at the size the photo deserves. */
export function ProductDetailClient({ id }: Props) {
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
  })

  if (isLoading) {
    return (
      <div className="grid gap-8 py-8 lg:grid-cols-12" aria-busy>
        <div className="aspect-square bg-paper-deep lg:col-span-6" />
        <div className="space-y-4 lg:col-span-6">
          <div className="h-12 bg-paper-deep" />
          <div className="h-28 w-2/3 bg-paper-deep" />
          <div className="h-36 bg-paper-deep" />
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="py-20">
        <p className="type-style text-5xl">Modelo no encontrado</p>
        <p className="mt-2 text-ink-soft">Puede que se haya retirado del catálogo.</p>
        <Link href="/#catalog" className="mt-6 inline-block font-semibold text-form underline">Volver al catálogo</Link>
      </div>
    )
  }

  return (
    <article className="pb-8">
      <nav aria-label="Ruta" className="flex items-center gap-2 py-4 text-xs text-ink-soft">
        <Link href="/#catalog" className="inline-flex items-center gap-1 hover:text-ink">
          <ArrowLeftIcon className="size-3.5" /> Catálogo
        </Link>
        <span>/</span>
        <Link href={categoryHref(product.category)} className="hover:text-ink">{product.category}</Link>
      </nav>

      <div className="grid gap-x-12 gap-y-8 lg:grid-cols-12">
        <div className="lg:sticky lg:top-24 lg:col-span-7 lg:self-start">
          {product.imageUrl && (
            <FloatingShoe
              src={product.imageUrl}
              alt={product.name}
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              transitionName={`shoe-${product.id}`}
              className="aspect-square [--shadow-y:22%]"
              imageClassName="p-8 lg:p-14"
            />
          )}
        </div>

        <div className="lg:col-span-5 lg:pt-4">
          <StyleOrder product={product} as="h1" />

          {product.description && (
            <div className="mt-10 border-t border-form-rule pt-5">
              <p className="mb-2 text-sm font-semibold">Descripción</p>
              <p className="max-w-[65ch] text-sm leading-relaxed text-ink-soft">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
