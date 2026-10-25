'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchProducts } from '@/lib/products'
import { ProductCard } from '@/components/ui/ProductCard'

/** A row of four styles under the hero, like the reference stores' "new in" strip. */
export function NewArrivals() {
  const { data } = useQuery({
    queryKey: ['products', 'new-arrivals'],
    queryFn: () => fetchProducts({ page: 0, size_page: 5 }),
  })
  // The first style is already the hero; show the next four.
  const products = data?.content.slice(1, 5) ?? []

  return (
    <section aria-labelledby="new-title" className="pt-16">
      <div className="flex items-baseline justify-between pb-5">
        <h2 id="new-title" className="type-section">Novedades</h2>
        <a href="#catalog" className="text-sm underline underline-offset-4">Ver todo</a>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
        {products.length === 0
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-square animate-pulse bg-paper-deep" />)
          : products.map(p => (
              <div key={p.id} className="scroll-in"><ProductCard product={p} /></div>
            ))}
      </div>
    </section>
  )
}
