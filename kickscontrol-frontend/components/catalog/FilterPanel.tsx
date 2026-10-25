'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { fetchBrands, fetchCategories } from '@/lib/products'
import { GENDER_LABEL, SIZE_RUN } from '@/lib/sheet'

const GENDERS = ['MAN', 'WOMAN', 'UNISEX']

interface Option { value: string; label: string }

/** A filter as a dropdown in the bar above the grid, the reference stores' pattern. */
function Dropdown({ label, paramKey, options, open, onOpen, active, onPick, grid }: {
  label: string
  paramKey: string
  options: Option[]
  open: boolean
  onOpen: (key: string | null) => void
  active: string | null
  onPick: (key: string, value: string) => void
  grid?: boolean
}) {
  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => onOpen(open ? null : paramKey)}
        className={`press inline-flex h-10 items-center gap-1.5 border px-4 text-sm font-medium ${
          active ? 'border-ink bg-ink text-paper' : 'border-form-rule hover:border-ink'
        }`}
      >
        {label}{active && `: ${options.find(o => o.value === active)?.label ?? active}`}
        <ChevronDownIcon className={`size-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="fade-up absolute top-12 left-0 z-30 min-w-56 border border-form-rule bg-paper p-2 shadow-[0_18px_40px_-20px_rgba(17,17,17,0.3)]" style={{ '--d': '0ms' } as React.CSSProperties}>
          <div className={grid ? 'grid grid-cols-5 gap-1' : 'flex flex-col'}>
            {options.map(o => {
              const selected = active === o.value
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => onPick(paramKey, o.value)}
                  aria-pressed={selected}
                  className={grid
                    ? `press relative h-10 border text-sm font-medium ${selected ? 'border-ink' : 'border-form-rule hover:border-ink'}`
                    : 'flex items-center justify-between gap-6 px-3 py-2 text-left text-sm hover:bg-form-wash'}
                >
                  {grid && selected && <span className="ink-mark" />}
                  <span className={`relative ${grid && selected ? 'text-paper' : ''}`}>{o.label}</span>
                  {!grid && selected && <CheckIcon className="size-4" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/** `lockedCategory` hides the category filter on a category's own page. */
export function FilterPanel({ lockedCategory = false }: { lockedCategory?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState<string | null>(null)
  const barRef = useRef<HTMLDivElement>(null)

  const { data: brands = [] } = useQuery({ queryKey: ['brands'], queryFn: fetchBrands })
  const { data: categories = [] } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories })

  // Close an open dropdown on outside click or Escape
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => { if (!barRef.current?.contains(e.target as Node)) setOpen(null) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null) }
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('pointerdown', onDown); window.removeEventListener('keydown', onKey) }
  }, [open])

  const push = useCallback((params: URLSearchParams) => {
    params.delete('page')
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}#catalog` : `${pathname}#catalog`, { scroll: false, transitionTypes: ['filter'] })
  }, [router, pathname])

  const toggle = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (params.get(key) === value) params.delete(key)
    else params.set(key, value)
    setOpen(null)
    push(params)
  }

  const remove = (key: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(key)
    push(params)
  }

  const chips: { key: string; label: string }[] = []
  if (searchParams.get('search')) chips.push({ key: 'search', label: `«${searchParams.get('search')}»` })
  for (const key of lockedCategory ? ['brand', 'size'] : ['brand', 'category', 'size']) {
    const v = searchParams.get(key)
    if (v) chips.push({ key, label: key === 'size' ? `Talla ${v}` : v })
  }
  const g = searchParams.get('gender')
  if (g) chips.push({ key: 'gender', label: GENDER_LABEL[g] ?? g })
  if (searchParams.get('inStock') === 'true') chips.push({ key: 'inStock', label: 'Con stock' })

  const inStock = searchParams.get('inStock') === 'true'

  return (
    <div ref={barRef}>
      <div className="flex flex-wrap items-center gap-2">
        <Dropdown label="Marca" paramKey="brand" options={brands.map(b => ({ value: b, label: b }))}
          open={open === 'brand'} onOpen={setOpen} active={searchParams.get('brand')} onPick={toggle} />
        {!lockedCategory && (
          <Dropdown label="Categoría" paramKey="category" options={categories.map(c => ({ value: c, label: c }))}
            open={open === 'category'} onOpen={setOpen} active={searchParams.get('category')} onPick={toggle} />
        )}
        <Dropdown label="Talla" paramKey="size" options={SIZE_RUN.map(s => ({ value: s, label: s }))} grid
          open={open === 'size'} onOpen={setOpen} active={searchParams.get('size')} onPick={toggle} />
        <Dropdown label="Género" paramKey="gender" options={GENDERS.map(v => ({ value: v, label: GENDER_LABEL[v] }))}
          open={open === 'gender'} onOpen={setOpen} active={g} onPick={toggle} />
        <button
          type="button"
          aria-pressed={inStock}
          onClick={() => toggle('inStock', 'true')}
          className={`press inline-flex h-10 items-center border px-4 text-sm font-medium ${
            inStock ? 'border-ink bg-ink text-paper' : 'border-form-rule hover:border-ink'
          }`}
        >
          Solo con stock
        </button>
      </div>

      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          {chips.map(c => (
            <button key={c.key} type="button" onClick={() => remove(c.key)}
              className="press inline-flex items-center gap-1 bg-form-wash px-3 py-1.5 hover:bg-paper-deep"
              aria-label={`Quitar filtro ${c.label}`}>
              {c.label} <XMarkIcon className="size-3.5" />
            </button>
          ))}
          <button type="button" onClick={() => router.push(`${pathname}#catalog`, { scroll: false, transitionTypes: ['filter'] })} className="press px-2 underline underline-offset-4">
            Limpiar todo
          </button>
        </div>
      )}
    </div>
  )
}
