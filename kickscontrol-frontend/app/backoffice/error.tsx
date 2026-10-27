'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { btnGhost, btnPrimary } from '@/components/backoffice/ui'

export default function BackofficeError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Backoffice Error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
      <ExclamationTriangleIcon className="size-8 text-alarm" />
      <div>
        <h2 className="type-name mb-2 text-2xl">Algo ha fallado en la trastienda</h2>
        <p className="max-w-sm text-sm text-ink-soft">
          {error.message || 'Ha ocurrido un error inesperado en el backoffice.'}
        </p>
        {error.digest && (
          <p className="type-label mt-2 text-ink-soft">ID: {error.digest}</p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className={btnPrimary}
        >
          <ArrowPathIcon className="size-4" />
          Reintentar
        </button>
        <Link
          href="/backoffice"
          className={btnGhost}
        >
          Ir al dashboard
        </Link>
      </div>
    </div>
  )
}
