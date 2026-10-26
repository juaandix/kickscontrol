'use client'

import { usePathname } from 'next/navigation'
import { toneForPath } from '@/lib/categories'

/** The store's sheet, re-toned on a category page so header, page and footer read as one world. */
export function ToneShell({ children }: { children: React.ReactNode }) {
  const tone = toneForPath(usePathname())
  return <div className={`sheet flex min-h-screen flex-col ${tone ? `tone-${tone}` : ''}`}>{children}</div>
}
