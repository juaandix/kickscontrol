import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { categoryTheme } from '@/lib/categories'
import { fetchCategoryShoes } from '@/lib/products'
import type { Product } from '@/types'
import { RunningPage } from '@/components/category/RunningPage'
import { BasketballPage } from '@/components/category/BasketballPage'
import { LifestylePage } from '@/components/category/LifestylePage'
import { SkatePage } from '@/components/category/SkatePage'
import { courtDisplay, editorialSerif, runMono, zineMarker } from '@/components/category/fonts'

// Stock changes all day: render per request and never serve a cached API response
export const dynamic = 'force-dynamic'

/** Each category is its own page, built around its discipline rather than one template re-coloured. */
const PAGES = {
  running: { Page: RunningPage, font: runMono },
  basketball: { Page: BasketballPage, font: courtDisplay },
  lifestyle: { Page: LifestylePage, font: editorialSerif },
  skateboarding: { Page: SkatePage, font: zineMarker },
} as const

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const theme = categoryTheme((await params).slug)
  return theme ? { title: `${theme.title} — KicksControl`, description: theme.intro } : {}
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const theme = categoryTheme((await params).slug)
  if (!theme) notFound()

  // If the API is down the page still renders and the browser retries.
  let initialProducts: Product[] = []
  try {
    initialProducts = await fetchCategoryShoes(theme.name)
  } catch {}

  // Fonts load here, on the server: next/font imported from a client module fails to resolve under Turbopack
  const { Page, font } = PAGES[theme.slug as keyof typeof PAGES]
  return (
    <div className={font.variable}>
      <Page slug={theme.slug} video={theme.video} poster={theme.poster} initialProducts={initialProducts} />
    </div>
  )
}
