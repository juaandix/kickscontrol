import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="sheet min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">

        {/* Big 404 */}
        <div className="relative select-none">
          <span className="text-[120px] font-extrabold text-form-rule leading-none block">404</span>
          <span className="absolute inset-0 flex items-center justify-center text-4xl font-extrabold text-ink tracking-tight">
            KICKS<span className="text-form">CONTROL</span>
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-extrabold text-ink">Página no encontrada</h1>
          <p className="text-sm text-ink-soft">
            La URL que buscas no existe o ha sido movida. Puede que el producto se haya dado de baja.
          </p>
        </div>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/"
            className="px-5 py-2.5 bg-ink hover:bg-form-deep text-paper text-sm font-bold transition-colors"
          >
            Ver catálogo
          </Link>
          <Link
            href="/orders"
            className="px-5 py-2.5 border border-form-rule hover:bg-paper-deep text-ink-soft text-sm font-medium transition-colors"
          >
            Mis pedidos
          </Link>
        </div>
      </div>
    </div>
  )
}
