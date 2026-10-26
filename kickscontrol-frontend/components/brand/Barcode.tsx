/**
 * The bars of a shoebox label, drawn from a reference code. Decorative: the code itself is always
 * printed next to it, so screen readers get the text, not the stripes.
 */
export function Barcode({ code, className = 'h-3.5' }: { code: string; className?: string }) {
  // Each character becomes two bars and two gaps, 1–3 units wide, between start and stop guards
  const widths: number[] = [1, 1, 1, 1]
  for (const ch of code) {
    const c = ch.charCodeAt(0)
    widths.push((c % 3) + 1, ((c >> 2) % 2) + 1, ((c >> 3) % 3) + 1, ((c >> 1) % 2) + 1)
  }
  widths.push(1, 1, 1)

  let x = 0
  const bars: { x: number; w: number }[] = []
  widths.forEach((w, i) => {
    if (i % 2 === 0) bars.push({ x, w })
    x += w
  })

  return (
    <svg viewBox={`0 0 ${x} 10`} preserveAspectRatio="none" className={`shrink-0 ${className}`} style={{ width: 'auto', aspectRatio: `${x / 4} / 10` }} aria-hidden fill="currentColor">
      {bars.map(b => <rect key={b.x} x={b.x} y={0} width={b.w} height={10} />)}
    </svg>
  )
}
