import type { ProductVariant } from '@/types'

/** The store's full EU size run, as printed on every line sheet cell. */
export const SIZE_RUN = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45']

export const LOW_STOCK = 5

export const GENDER_LABEL: Record<string, string> = {
  MAN: 'Hombre',
  WOMAN: 'Mujer',
  UNISEX: 'Unisex',
}

const priceFormat = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
export const formatPrice = (value: number) => priceFormat.format(value)

/** "NK-AJ1H-42-CH" → "NK-AJ1H": the style code without size and colour. */
export function styleCode(variants: ProductVariant[]): string | null {
  const sku = variants[0]?.sku
  if (!sku) return null
  return sku.split('-').slice(0, -2).join('-')
}

/** next/image re-encodes already-escaped URLs (e.g. %27), and Puma's CDN refuses the optimizer; serve those as-is. */
export const rawImage = (url: string) => url.includes('%') || url.includes('images.puma.com')

/** Nike and Puma ship studio shots with their own backdrop: show them as full-bleed photos, not cut-outs. */
export const hasBackdrop = (url: string) => url.includes('static.nike.com') || url.includes('images.puma.com')

/** The catalog stores Nike's 320px default rendition; ask Nike's CDN for its 1728px product-page size instead. */
export const productImage = (url: string) =>
  url.includes('static.nike.com') ? url.replace('/t_default/', '/t_PDP_1728_v1/f_auto,q_auto:eco/') : url

export const sortSizes = (sizes: string[]) => [...sizes].sort((a, b) => Number(a) - Number(b))

// Colourway names come from the brands ("Chicago", "Core Black", "Sail/Pink");
// each part maps to the ink a buyer would expect on the swatch.
const SWATCH_WORDS: [RegExp, string][] = [
  [/chicago|university red|scarlet|\bred\b/i, '#c32a2a'],
  [/volt/i, '#d4ef1c'],
  [/pink/i, '#eeb1c4'],
  [/sail|moonbeam/i, '#e6e0cf'],
  [/shadow|grey|gray/i, '#8d8f93'],
  [/navy|peacoat/i, '#1f2a48'],
  [/blue/i, '#2f5fc4'],
  [/green/i, '#2d7046'],
  [/black/i, '#141414'],
  [/white/i, '#fbfbf8'],
]

export function swatchInks(color: string): string[] {
  const parts = color.split('/').map(p => p.trim())
  const inks = parts.map(part => SWATCH_WORDS.find(([re]) => re.test(part))?.[1] ?? '#b9b6ad')
  // Chicago is the white/red/black colourway; show its red over white
  if (/chicago/i.test(color)) return ['#c32a2a', '#fbfbf8']
  return inks
}
