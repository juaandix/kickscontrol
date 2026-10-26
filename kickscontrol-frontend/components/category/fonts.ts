import { Big_Shoulders, Instrument_Serif, JetBrains_Mono, Permanent_Marker } from 'next/font/google'

/** Each category page speaks in its own type. */
export const runMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-run' })
export const courtDisplay = Big_Shoulders({ subsets: ['latin'], weight: ['700', '900'], variable: '--font-court' })
export const editorialSerif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-editorial' })
export const zineMarker = Permanent_Marker({ subsets: ['latin'], weight: '400', variable: '--font-zine' })
