'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { fetchBrands, fetchCategories } from '@/lib/products'
import { useCallback } from 'react'

const SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45']
const GENDERS = [
  { value: 'MAN', label: 'Hombre' },
  { value: 'WOMAN', label: 'Mujer' },
  { value: 'UNISEX', label: 'Unisex' },
]

export function FilterPanel() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { data: brands = [] } = useQuery({ queryKey: ['brands'], queryFn: fetchBrands })
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories })

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('page')
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/?${params.toString()}`)
    },
    [router, searchParams]
  )

  const toggleFilter = useCallback(
    (key: string, value: string) => {
      const current = searchParams.get(key)
      updateFilter(key, current === value ? null : value)
    },
    [searchParams, updateFilter]
  )

  const clearAll = () => router.push('/')

  const hasFilters = ['brand', 'gender', 'category', 'size', 'inStock'].some(k => searchParams.has(k))

  const FilterGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">{label}</p>
      {children}
    </div>
  )

  const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
        active
          ? 'bg-orange-500 text-white border-orange-500'
          : 'bg-white text-neutral-700 border-neutral-300 hover:border-orange-400'
      }`}
    >
      {label}
    </button>
  )

  return (
    <aside className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-neutral-900">Filtros</h2>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-orange-500 hover:underline">
            Limpiar todo
          </button>
        )}
      </div>

      <FilterGroup label="Marca">
        <div className="flex flex-wrap gap-2">
          {brands.map(brand => (
            <Chip
              key={brand}
              label={brand}
              active={searchParams.get('brand') === brand}
              onClick={() => toggleFilter('brand', brand)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Género">
        <div className="flex flex-wrap gap-2">
          {GENDERS.map(g => (
            <Chip
              key={g.value}
              label={g.label}
              active={searchParams.get('gender') === g.value}
              onClick={() => toggleFilter('gender', g.value)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Categoría">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <Chip
              key={cat}
              label={cat}
              active={searchParams.get('category') === cat}
              onClick={() => toggleFilter('category', cat)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Talla">
        <div className="flex flex-wrap gap-2">
          {SIZES.map(size => (
            <Chip
              key={size}
              label={size}
              active={searchParams.get('size') === size}
              onClick={() => toggleFilter('size', size)}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Disponibilidad">
        <Chip
          label="Solo con stock"
          active={searchParams.get('inStock') === 'true'}
          onClick={() => toggleFilter('inStock', 'true')}
        />
      </FilterGroup>
    </aside>
  )
}
