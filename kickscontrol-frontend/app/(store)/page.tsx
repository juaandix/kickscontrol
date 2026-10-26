import { Suspense } from 'react'
import { HomeHero } from '@/components/catalog/HomeHero'
import { NewArrivals } from '@/components/catalog/NewArrivals'
import { CategoryTiles } from '@/components/catalog/CategoryTiles'
import { FilterPanel } from '@/components/catalog/FilterPanel'
import { ProductGrid } from '@/components/catalog/ProductGrid'

export const metadata = { title: 'KicksControl — Zapatillas y ropa con stock real por talla' }

export default function CatalogPage() {
  return (
    <div>
      <HomeHero />
      <NewArrivals />
      <CategoryTiles />

      <section id="catalog" aria-labelledby="catalog-title" className="scroll-mt-20 pt-20">
        <h2 id="catalog-title" className="type-section pb-5">El almacén</h2>
        <div className="sticky top-16 z-20 -mx-4 bg-paper px-4 py-3 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
          <Suspense>
            <FilterPanel />
          </Suspense>
        </div>
        <div className="pt-4">
          <Suspense>
            <ProductGrid />
          </Suspense>
        </div>
      </section>
    </div>
  )
}
