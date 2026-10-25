import Image from 'next/image'
import { ViewTransition } from 'react'
import { hasBackdrop, rawImage, productImage } from '@/lib/sheet'
import { Tilt } from './Tilt'

interface Props {
  src: string
  alt: string
  sizes: string
  priority?: boolean
  /** Shared with the catalog cell so the shoe morphs between pages */
  transitionName?: string
  className?: string
  imageClassName?: string
}

/** The product hovering over its own shadow, leaning toward the cursor. */
export function FloatingShoe({ src, alt, sizes, priority, transitionName, className = '', imageClassName = 'p-8 lg:p-12' }: Props) {
  // A photo with its own backdrop is shown flat and full-bleed; only cut-outs float over a shadow.
  const backdrop = hasBackdrop(src)
  const image = (
    <Image
      src={productImage(src)}
      alt={alt}
      fill
      priority={priority}
      unoptimized={rawImage(src)}
      sizes={sizes}
      className={`on-paper ${backdrop ? 'object-cover' : `object-contain ${imageClassName}`}`}
    />
  )

  const stage = (
    <div className={`shoe-stage ${className}`}>
      <Tilt className="absolute inset-0" max={7}>
        <div className="shoe-enter">
          <div className={backdrop ? 'absolute inset-0' : 'shoe-float'}>
            {image}
          </div>
        </div>
      </Tilt>
      {!backdrop && <span className="shoe-shadow" aria-hidden />}
    </div>
  )

  return transitionName ? <ViewTransition name={transitionName} share="morph">{stage}</ViewTransition> : stage
}
