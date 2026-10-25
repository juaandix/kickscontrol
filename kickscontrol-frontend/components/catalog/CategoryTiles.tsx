'use client'

import Image from 'next/image'
import Link from 'next/link'
import { categoryHref } from '@/lib/categories'
import { useQueries, useQuery } from '@tanstack/react-query'
import { fetchCategories, fetchProducts } from '@/lib/products'
import { hasBackdrop, rawImage, productImage } from '@/lib/sheet'

/** One large tile per category, each showing a real shoe from it, as SVD does with its category blocks. */
export function CategoryTiles() {
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories })
  const leads = useQueries({
    queries: categories.map(category => ({
      queryKey: ['products', 'category-lead', category],
      queryFn: () => fetchProducts({ category, page: 0, size_page: 1 }),
    })),
  })

  return (
    <section aria-labelledby="lines-title" className="pt-20">
      <h2 id="lines-title" className="type-section pb-5">Comprar por categoría</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {categories.map((category, i) => {
          const lead = leads[i]?.data?.content[0]
          return (
            <Link
              key={category}
              href={categoryHref(category)}
              className="tile tile-zoom scroll-in group relative block aspect-[3/4] overflow-hidden"
            >
              {lead?.imageUrl && (
                <Image
                  src={productImage(lead.imageUrl)}
                  alt=""
                  fill
                  unoptimized={rawImage(lead.imageUrl)}
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className={`on-paper ${hasBackdrop(lead.imageUrl) ? 'object-cover' : 'object-contain p-6'}`}
                />
              )}
              <span className="type-style absolute bottom-3 left-3 text-[clamp(1.4rem,6vw,2rem)] sm:bottom-4 sm:left-4 lg:text-[clamp(2rem,3vw,3rem)]">{category}</span>
              <span className="absolute top-4 right-4 text-xs font-medium underline-offset-4 group-hover:underline">Ver todo</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
