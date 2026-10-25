import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CATEGORY_THEMES, categoryTheme } from '@/lib/categories'
import { RunningPage } from '@/components/category/RunningPage'
import { BasketballPage } from '@/components/category/BasketballPage'
import { LifestylePage } from '@/components/category/LifestylePage'
import { SkatePage } from '@/components/category/SkatePage'

/** Each category is its own page, built around its discipline rather than one template re-coloured. */
const PAGES = {
  running: RunningPage,
  basketball: BasketballPage,
  lifestyle: LifestylePage,
  skateboarding: SkatePage,
} as const

export function generateStaticParams() {
  return CATEGORY_THEMES.map(c => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const theme = categoryTheme((await params).slug)
  return theme ? { title: `${theme.title} — KicksControl`, description: theme.intro } : {}
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const theme = categoryTheme((await params).slug)
  if (!theme) notFound()
  const Page = PAGES[theme.slug as keyof typeof PAGES]
  return <Page video={theme.video} poster={theme.poster} />
}
