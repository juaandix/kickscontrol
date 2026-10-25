'use client'

import { useEffect, useState } from 'react'
import type { Product, ProductVariant } from '@/types'
import { useCart } from '@/context/CartContext'
import { StockBadge } from '@/components/ui/StockBadge'
import { GENDER_LABEL, formatPrice } from '@/lib/sheet'
import { CheckIcon } from '@heroicons/react/20/solid'
import { VariantMatrix } from './VariantMatrix'

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

      <div className="flex min-h-12 flex-wrap items-center gap-x-3 gap-y-1 py-3 text-sm" aria-live="polite">
        {selected && (
          <>
            <span className="text-ink-soft">
              {selected.color} · Talla {selected.size} · {selected.stockQuantity} {selected.stockQuantity === 1 ? 'disponible' : 'disponibles'}
              {selected.priceModifier > 0 && ` · +${formatPrice(selected.priceModifier)}`}
            </span>
            <StockBadge stock={selected.stockQuantity} />
          </>
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
