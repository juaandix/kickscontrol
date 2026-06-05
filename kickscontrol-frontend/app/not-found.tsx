import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">

        {/* Big 404 */}
        <div className="relative select-none">
          <span className="text-[120px] font-black text-neutral-100 leading-none block">404</span>
          <span className="absolute inset-0 flex items-center justify-center text-4xl font-black text-neutral-900 tracking-tight">
            KICKS<span className="text-orange-500">CONTROL</span>
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-black text-neutral-900">Página no encontrada</h1>
          <p className="text-sm text-neutral-500">
            La URL que buscas no existe o ha sido movida. Puede que el producto se haya dado de baja.
          </p>
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/"
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors"
          >
            Ver catálogo
          </Link>
          <Link
            href="/orders"
            className="px-5 py-2.5 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-sm font-medium rounded-xl transition-colors"
          >
            Mis pedidos
          </Link>
        </div>
      </div>
    </div>
  )
}
