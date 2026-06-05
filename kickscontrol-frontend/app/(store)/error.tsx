'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Store Error]', error)
  }, [error])

  return (
    <div className="max-w-lg mx-auto py-24 text-center space-y-6">
      <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-orange-400" />
      <div>
        <h2 className="text-xl font-black text-neutral-900 mb-2">Error al cargar la página</h2>
        <p className="text-sm text-neutral-500">
          {error.message || 'No se ha podido cargar el contenido. Inténtalo de nuevo.'}
        </p>
      </div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-sm font-medium rounded-xl transition-colors"
        >
          Ir al catálogo
        </Link>
      </div>
    </div>
  )
}
