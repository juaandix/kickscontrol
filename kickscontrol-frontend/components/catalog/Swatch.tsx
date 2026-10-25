import { swatchInks } from '@/lib/sheet'

/** A cut colour chip, split diagonally for two-tone colourways. */
export function Swatch({ color, className = 'size-4' }: { color: string; className?: string }) {
  const [a, b = a] = swatchInks(color)
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 ring-1 ring-inset ring-ink/20 ${className}`}
      style={{ background: `linear-gradient(135deg, ${a} 0 50%, ${b} 50% 100%)` }}
    />
  )
}
