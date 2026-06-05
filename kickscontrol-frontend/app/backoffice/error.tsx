'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

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
      <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
        <ExclamationTriangleIcon className="w-7 h-7 text-red-500" />
      </div>
      <div>
        <h2 className="text-lg font-black text-white mb-1">Error en el panel</h2>
        <p className="text-sm text-neutral-400 max-w-sm">
          {error.message || 'Ha ocurrido un error inesperado en el backoffice.'}
        </p>
        {error.digest && (
          <p className="text-xs text-neutral-500 font-mono mt-2">ID: {error.digest}</p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Reintentar
        </button>
        <Link
          href="/backoffice"
          className="px-4 py-2.5 border border-neutral-600 hover:bg-neutral-800 text-neutral-300 text-sm font-medium rounded-xl transition-colors"
        >
          Ir al dashboard
        </Link>
      </div>
    </div>
  )
}
