'use client'

import { useEffect, useState } from 'react'
import type { Product, ProductVariant } from '@/types'
import { useCart } from '@/context/CartContext'
import { StockBadge } from '@/components/ui/StockBadge'
import { GENDER_LABEL, formatPrice } from '@/lib/sheet'
import { CheckIcon } from '@heroicons/react/20/solid'
import { VariantMatrix } from './VariantMatrix'
import { Barcode } from '@/components/brand/Barcode'

interface Props {
  product: Product
  /** h1 on the product page, h2 when the style is featured on the home sheet */
  as?: 'h1' | 'h2'
}

/** One style's entry on the order sheet: fields, size run, and the order action. */
export function StyleOrder({ product, as: Heading = 'h2' }: Props) {
  const { addItem } = useCart()
  const [selected, setSelected] = useState<ProductVariant | null>(null)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  // The confirmation holds just long enough to read, then the button is ready for the next pair.
  useEffect(() => {
    if (!added) return
    const t = setTimeout(() => setAdded(false), 1600)
    return () => clearTimeout(t)
  }, [added])

  const price = product.basePrice + (selected?.priceModifier ?? 0)

  const add = async () => {
    if (!selected) return
    setAdding(true)
    try {
      await addItem(selected.id, 1)
      setAdded(true)
    } finally { setAdding(false) }
  }

  return (
    <div className="flex flex-col">
      <div className="pb-8">
        <p className="text-sm text-ink-soft">{product.brand}</p>
        <Heading className="type-name mt-1 text-[clamp(2rem,3.2vw,2.75rem)]">{product.name}</Heading>
        <p className="mt-3 text-xl font-semibold">{formatPrice(price)}</p>
        <p className="mt-1 text-sm text-ink-soft">{product.category} · {GENDER_LABEL[product.gender] ?? product.gender}</p>
      </div>

      <p className="pb-2 text-sm font-semibold">Stock por talla y color</p>

      <VariantMatrix variants={product.variants} selectedId={selected?.id ?? null} onSelect={setSelected} />

      {/* Picking a size prints the end label of the box that will ship */}
      <div className="py-3" aria-live="polite">
        {selected ? (
          <div key={selected.id} className="label-in grid grid-cols-[1fr_auto] gap-x-4 border border-ink px-4 py-3">
            <p className="type-label text-ink-soft">KicksControl · {product.brand}</p>
            <p className="type-label row-span-2 self-center text-right">
              Talla<span className="block text-2xl leading-none font-bold tracking-normal">{selected.size}</span>
            </p>
            <p className="text-sm font-semibold">{product.name} · {selected.color}</p>
            <div className="col-span-2 mt-2 flex items-end gap-3 border-t border-dashed border-form-rule pt-2">
              <Barcode code={selected.sku} className="h-7" />
              <span className="type-label">{selected.sku}</span>
              <span className="ml-auto flex items-center gap-2">
                <span className="type-label text-ink-soft">
                  {selected.stockQuantity} {selected.stockQuantity === 1 ? 'ud' : 'uds'}
                  {selected.priceModifier > 0 && ` · +${formatPrice(selected.priceModifier)}`}
                </span>
                <StockBadge stock={selected.stockQuantity} />
              </span>
            </div>
          </div>
        ) : (
          <p className="type-label flex min-h-12 items-center text-ink-soft">Elige talla y color: te enseñamos la etiqueta de tu caja</p>
        )}
      </div>

      <button
        type="button"
        onClick={add}
        disabled={!selected || adding}
        className="sheen h-14 w-full bg-ink text-base font-bold text-paper transition-[background-color,transform] duration-150 hover:bg-form-deep active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-paper-deep disabled:text-ink-soft"
      >
        <span key={added ? 'added' : 'idle'} className={added ? 'label-in inline-flex items-center gap-2' : undefined}>
          {added ? <><CheckIcon className="size-5" /> Añadido</> : adding ? 'Añadiendo…' : selected ? 'Añadir al carrito' : 'Elige una talla'}
        </span>
      </button>
    </div>
  )
}
