'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/20/solid'
import { fetchProducts } from '@/lib/products'
import { ProductCard } from '@/components/ui/ProductCard'
import type { ProductFilters } from '@/types'

/** `category` pins the grid to one category, as on its landing page. */
export function ProductGrid({ category }: { category?: string }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const filters: ProductFilters = {
    search: searchParams.get('search') ?? undefined,
    brand: searchParams.get('brand') ?? undefined,
    gender: searchParams.get('gender') ?? undefined,
    category: category ?? searchParams.get('category') ?? undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    size: searchParams.get('size') ?? undefined,
    inStock: searchParams.get('inStock') === 'true' ? true : undefined,
    page: Number(searchParams.get('page') ?? 0),
    size_page: 16,
  }

  // Keep the current grid on screen while the next filter loads, instead of flashing skeletons.
  const { data, isLoading, isError, isPlaceholderData } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    placeholderData: keepPreviousData,
  })

  const setPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`${pathname}?${params.toString()}#catalog`, { transitionTypes: ['filter'] })
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4" aria-busy>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse bg-paper-deep" />
        ))}
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="py-16">
        <p className="font-semibold">No hemos podido cargar el catálogo.</p>
        <p className="mt-1 text-sm text-ink-soft">Comprueba que la API está en marcha y recarga la página.</p>
      </div>
    )
  }

  if (data.content.length === 0) {
    return (
      <div className="py-16">
        <p className="type-name text-3xl">Sin resultados</p>
        <p className="mt-2 text-sm text-ink-soft">Ningún modelo cumple esos filtros. Quita alguno o usa «Limpiar todo».</p>
      </div>
    )
  }

  return (
    <div className={isPlaceholderData ? 'grid-busy' : 'grid-idle'} aria-busy={isPlaceholderData}>
      <p className="pb-4 text-sm text-ink-soft">
        {data.totalElements} {data.totalElements === 1 ? 'producto' : 'productos'}
      </p>
      {/* Keyed by the query so a new result set replays the stagger */}
      <div key={searchParams.toString()} className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        {data.content.map((product, i) => (
          <div key={product.id} className="scroll-in">
            <div className="card-in" style={{ '--d': `${Math.min(i, 7) * 40}ms` } as React.CSSProperties}>
              <ProductCard product={product} morph />
            </div>
          </div>
        ))}
      </div>

      {data.totalPages > 1 && (
        <nav aria-label="Páginas" className="mt-12 flex items-center justify-between border-t border-form-rule pt-5 text-sm font-medium">
          <button
            disabled={data.first}
            onClick={() => setPage(data.number - 1)}
            className="press inline-flex items-center gap-1.5 py-2 hover:underline underline-offset-4 disabled:text-ink-soft/50"
          >
            <ArrowLeftIcon className="size-4" /> Anterior
          </button>
          <span className="text-ink-soft">Página {data.number + 1} de {data.totalPages}</span>
          <button
            disabled={data.last}
            onClick={() => setPage(data.number + 1)}
            className="press inline-flex items-center gap-1.5 py-2 hover:underline underline-offset-4 disabled:text-ink-soft/50"
          >
            Siguiente <ArrowRightIcon className="size-4" />
          </button>
        </nav>
      )}
    </div>
  )
}
