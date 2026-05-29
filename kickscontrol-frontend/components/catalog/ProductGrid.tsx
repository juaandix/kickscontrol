'use client'

import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { fetchProducts } from '@/lib/products'
import { ProductCard } from '@/components/ui/ProductCard'
import type { ProductFilters } from '@/types'

export function ProductGrid() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const filters: ProductFilters = {
    brand: searchParams.get('brand') ?? undefined,
    gender: searchParams.get('gender') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    size: searchParams.get('size') ?? undefined,
    inStock: searchParams.get('inStock') === 'true' ? true : undefined,
    page: Number(searchParams.get('page') ?? 0),
    size_page: 12,
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
  })

  const setPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`/?${params.toString()}`)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-neutral-200 animate-pulse aspect-[3/4]" />
        ))}
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="py-16 text-center text-neutral-500">
        Error al cargar los productos. Inténtalo de nuevo.
      </div>
    )
  }

  if (data.content.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-2xl mb-2">🔍</p>
        <p className="font-semibold text-neutral-700">Sin resultados</p>
        <p className="text-sm text-neutral-500 mt-1">Prueba con otros filtros</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-neutral-500">
        <span>{data.totalElements} productos</span>
        <span>Página {data.number + 1} de {data.totalPages}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.content.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {data.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            disabled={data.first}
            onClick={() => setPage(data.number - 1)}
            className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 hover:bg-neutral-100"
          >
            ← Anterior
          </button>
          <button
            disabled={data.last}
            onClick={() => setPage(data.number + 1)}
            className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40 hover:bg-neutral-100"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}
