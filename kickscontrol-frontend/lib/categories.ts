export interface CategoryTheme {
  slug: string
  /** The value the API filters by */
  name: string
  title: string
  /** Meta description */
  intro: string
  video: string
  poster: string
}

/** The categories that have their own page. Each page's layout and copy live in components/category. */
export const CATEGORY_THEMES: CategoryTheme[] = [
  { slug: 'running', name: 'Running', title: 'Running', intro: 'Zapatillas para rodar a diario, tirar series o preparar tu primera carrera, con el stock real de tu talla.', video: '/media/cat-running.mp4', poster: '/media/cat-running.jpg' },
  { slug: 'basketball', name: 'Basketball', title: 'Basketball', intro: 'Sujeción, tracción y siluetas nacidas en la cancha que siguen fuera de ella.', video: '/media/cat-basketball.mp4', poster: '/media/cat-basketball.jpg' },
  { slug: 'lifestyle', name: 'Lifestyle', title: 'Lifestyle', intro: 'Siluetas de siempre y lanzamientos recientes para llevar con cualquier cosa.', video: '/media/cat-lifestyle.mp4', poster: '/media/cat-lifestyle.jpg' },
  { slug: 'skateboarding', name: 'Skateboarding', title: 'Skateboarding', intro: 'Suela vulcanizada, refuerzos donde roza la lija y siluetas de skatepark.', video: '/media/cat-skateboarding.mp4', poster: '/media/cat-skateboarding.jpg' },
]

export function categoryTheme(slug: string) {
  return CATEGORY_THEMES.find(c => c.slug === slug)
}

/** Where a category links to: its own page when it has one, otherwise the filtered catalogue. */
export function categoryHref(name: string) {
  const theme = CATEGORY_THEMES.find(c => c.name.toLowerCase() === name.toLowerCase())
  return theme ? `/categoria/${theme.slug}` : `/?category=${encodeURIComponent(name)}#catalog`
}
