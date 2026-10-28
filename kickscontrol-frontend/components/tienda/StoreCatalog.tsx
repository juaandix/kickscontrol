'use client'

import { useEffect, useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { fetchProducts } from '@/lib/products'
import { CATEGORY_THEMES } from '@/lib/categories'
import { formatPrice } from '@/lib/sheet'
import type { Product } from '@/types'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { ProductSizes } from './ProductSizes'

/** The shop-floor catalog: every model, filtered by category or name, and the sizes left in the stockroom. */
export function StoreCatalog() {
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [picked, setPicked] = useState<Product | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setSearch(query.trim()), 250)
    return () => clearTimeout(t)
  }, [query])

  const { data, isPending, isPlaceholderData } = useQuery({
    queryKey: ['store-catalog', search, category],
    queryFn: () => fetchProducts({ search: search || undefined, category: category || undefined, size_page: 60 }),
    placeholderData: keepPreviousData,
  })
  const products = data?.content ?? []

  if (picked) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <ProductSizes product={picked} onBack={() => setPicked(null)} backLabel="Catálogo" hint="unidades en el almacén de la tienda" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="flex h-12 flex-1 items-center gap-3 border-2 border-ink px-4 lg:max-w-md">
          <MagnifyingGlassIcon className="size-5 shrink-0 text-ink-soft" />
          <span className="sr-only">Buscar modelo</span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Busca un modelo o una marca"
            style={{ outline: 'none' }}
            className="min-w-0 flex-1 bg-transparent text-base placeholder:text-ink-soft/60"
          />
        </label>
        <div role="group" aria-label="Categoría" className="flex gap-1 overflow-x-auto">
          {[{ name: '', title: 'Todo' }, ...CATEGORY_THEMES].map(c => (
            <button
              key={c.title}
              onClick={() => setCategory(c.name)}
              aria-pressed={category === c.name}
              className={`press h-12 shrink-0 border px-4 text-sm font-semibold ${category === c.name ? 'border-ink bg-ink text-paper' : 'border-form-rule hover:border-ink'}`}
            >
              {c.title}
            </button>
          ))}
        </div>
        <p className="type-label text-ink-soft lg:ml-auto">{data ? `${data.totalElements} modelos` : ''}</p>
      </div>

      {isPending ? (
        <p className="type-label mt-8 text-ink-soft">Cargando el catálogo…</p>
      ) : products.length === 0 ? (
        <p className="mt-8 text-sm text-ink-soft">No hay modelos que coincidan.</p>
      ) : (
        <ul aria-label="Modelos" className={`mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ${isPlaceholderData ? 'grid-busy' : 'grid-idle'}`}>
          {products.map(p => {
            const stock = p.totalStock ?? 0
            return (
              <li key={p.id}>
                <button onClick={() => setPicked(p)} className="press group block w-full text-left">
                  <div className="tile aspect-square overflow-hidden">
                    {p.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUrl} alt="" loading="lazy" className="on-paper size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                  </div>
                  <p className="mt-2 truncate text-sm font-semibold">{p.name}</p>
                  <p className="type-label mt-0.5 flex justify-between text-ink-soft">
                    <span>{p.brand}</span>
                    <span className={stock === 0 ? 'text-alarm' : ''}>{stock === 0 ? 'Agotado' : `${stock} uds`}</span>
                  </p>
                  <p className="mt-1 text-sm tabular-nums">{formatPrice(Number(p.basePrice))}</p>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
