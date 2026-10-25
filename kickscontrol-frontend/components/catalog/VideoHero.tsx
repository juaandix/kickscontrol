'use client'

import { useRef } from 'react'
import { useLoopVideo } from '@/components/category/shared'

interface Props {
  video: string
  poster: string
  /** object-position for the footage, so the subject stays in frame */
  focus?: string
  eyebrow?: string
  /** Set the eyebrow on the page's --accent colour */
  accent?: boolean
  title: string
  subtitle: string
  cta: string
  /** id of the section the CTA glides down to */
  target: string
}

/** Full-bleed looping footage behind a headline. Clips: Mixkit (free licence), re-encoded in public/media. */
export function VideoHero({ video, poster, focus = 'center 80%', eyebrow, accent, title, subtitle, cta, target }: Props) {
  const ref = useRef<HTMLVideoElement>(null)

  useLoopVideo(ref)

  return (
    <section aria-labelledby="hero-title" className="relative -mx-4 overflow-hidden bg-ink sm:-mx-6 lg:-mx-10">
      <video
        key={video}
        ref={ref}
        className="bg-video h-[70vh] min-h-[420px] w-full object-cover"
        style={{ objectPosition: focus }}
        src={video}
        poster={poster}
        muted
        loop
        playsInline
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <div
        className="fade-up absolute inset-x-0 bottom-0 px-4 pb-12 text-paper sm:px-6 sm:pb-16 lg:px-10"
        style={{ '--d': '200ms' } as React.CSSProperties}
      >
        {eyebrow && (
          <p
            className={`mb-4 inline-block text-xs font-semibold uppercase tracking-[0.18em] ${accent ? 'px-2.5 py-1' : 'text-paper/80'}`}
            style={accent ? { background: 'var(--accent)', color: 'var(--accent-ink)' } : undefined}
          >
            {eyebrow}
          </p>
        )}
        <h1 id="hero-title" className="type-name max-w-3xl text-[clamp(2.25rem,5.5vw,4.5rem)]">{title}</h1>
        <p className="mt-3 max-w-xl text-sm text-paper/80 sm:text-base">{subtitle}</p>
        <a
          href={`#${target}`}
          onClick={e => {
            // Glide down to the section rather than jumping; reduced motion keeps the jump.
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
            e.preventDefault()
            document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' })
            history.replaceState(null, '', `#${target}`)
          }}
          className="press mt-7 inline-block bg-paper px-8 py-3.5 text-sm font-semibold text-ink hover:bg-paper-deep"
        >
          {cta}
        </a>
      </div>
    </section>
  )
}
