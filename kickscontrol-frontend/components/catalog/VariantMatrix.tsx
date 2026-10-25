'use client'

import type { ProductVariant } from '@/types'
import { LOW_STOCK, sortSizes } from '@/lib/sheet'
import { Swatch } from './Swatch'
import { CountUp } from '@/components/motion/CountUp'

interface Props {
  variants: ProductVariant[]
  selectedId: number | null
  onSelect: (variant: ProductVariant) => void
}

/**
 * The size run of a style as the order sheet prints it: one row per
 * colourway, one column per EU size, live units in each cell. Marking a
 * cell selects that exact variant.
 */
export function VariantMatrix({ variants, selectedId, onSelect }: Props) {
  const active = variants.filter(v => v.isActive)
  const colors = [...new Set(active.map(v => v.color))]
  const sizes = sortSizes([...new Set(active.map(v => v.size))])
  const find = (color: string, size: string) => active.find(v => v.color === color && v.size === size)

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">Unidades disponibles por color y talla</caption>
        <thead>
          <tr className="border-b border-ink">
            <th scope="col" className="type-field py-2 pr-3 font-semibold">Talla EU</th>
            {sizes.map(size => (
              <th key={size} scope="col" className="type-field w-14 py-2 text-center font-semibold">
                {size}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {colors.map((color, row) => (
            <tr key={color} className="matrix-row border-b border-form-rule" style={{ '--d': `${500 + row * 90}ms` } as React.CSSProperties}>
              <th scope="row" className="py-0 pr-3 font-normal">
                <span className="flex items-center gap-2 py-2 text-sm font-semibold whitespace-nowrap">
                  <Swatch color={color} />
                  {color}
                </span>
              </th>
              {sizes.map((size, col) => {
                const v = find(color, size)
                if (!v) {
                  return (
                    <td key={size} className="border-l border-form-rule text-center text-ink-soft" aria-label={`Talla ${size} no disponible en ${color}`}>
                      ·
                    </td>
                  )
                }
                const out = v.stockQuantity === 0
                const low = !out && v.stockQuantity <= LOW_STOCK
                const selected = v.id === selectedId
                return (
                  <td key={size} className="border-l border-form-rule p-0">
                    <button
                      type="button"
                      disabled={out}
                      onClick={() => onSelect(v)}
                      aria-pressed={selected}
                      aria-label={`${color}, talla ${size}: ${out ? 'agotada' : `${v.stockQuantity} unidades`}`}
                      className={`relative grid h-11 w-full min-w-11 place-items-center text-base font-semibold transition-colors ${
                        out
                          ? 'cursor-not-allowed text-ink-soft/60 line-through'
                          : 'cursor-pointer hover:bg-form-wash'
                      } ${low && !selected ? 'text-alarm' : ''}`}
                    >
                      {selected && <span className="ink-mark" aria-hidden />}
                      <span className={`relative ${selected ? 'text-paper' : ''}`}>
                        <CountUp value={v.stockQuantity} fromZero duration={450} delay={row * 50 + col * 25} />
                      </span>
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
