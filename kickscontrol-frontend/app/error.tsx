'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[KicksControl Error]', error)
  }, [error])

  return (
    <html lang="es">
      <body className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-6xl font-black text-neutral-200 select-none">500</div>
          <div>
            <h1 className="text-2xl font-black text-neutral-900 mb-2">Algo salió mal</h1>
            <p className="text-neutral-500 text-sm">
              Ha ocurrido un error inesperado. Nuestro equipo ya está trabajando en ello.
            </p>
            {error.digest && (
              <p className="text-xs text-neutral-400 font-mono mt-2">ID: {error.digest}</p>
            )}
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
              Volver al inicio
            </Link>
          </div>
          <p className="text-xs text-neutral-300 font-black tracking-tight">
            KICKS<span className="text-orange-400">CONTROL</span>
          </p>
        </div>
      </body>
    </html>
  )
}
