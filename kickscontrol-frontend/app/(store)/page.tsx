import { Suspense } from 'react'
import { HeroSection } from '@/components/catalog/HeroSection'
import { FilterPanel } from '@/components/catalog/FilterPanel'
import { ProductGrid } from '@/components/catalog/ProductGrid'

export const metadata = { title: 'KicksControl — Tu tienda de zapatillas' }

export default function CatalogPage() {
  return (
    <div className="space-y-10">
      <HeroSection />

      <div id="catalog" className="flex flex-col lg:flex-row gap-8 scroll-mt-20">
        <div className="lg:w-56 shrink-0">
          <Suspense>
            <FilterPanel />
          </Suspense>
        </div>
        <div className="flex-1 min-w-0">
          <Suspense>
            <ProductGrid />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
