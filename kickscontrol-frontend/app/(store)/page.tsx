import { Suspense } from 'react'
import { FilterPanel } from '@/components/catalog/FilterPanel'
import { ProductGrid } from '@/components/catalog/ProductGrid'

export const metadata = { title: 'Catálogo — KicksControl' }

export default function CatalogPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
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
  )
}
