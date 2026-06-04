import Link from 'next/link'

const CATEGORIES = ['Running', 'Basketball', 'Lifestyle', 'Training', 'Skate']
const GENDERS = ['Hombre', 'Mujer', 'Unisex']

export function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <span className="text-xl font-black tracking-tight text-neutral-900">
              KICKS<span className="text-orange-500">CONTROL</span>
            </span>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Tu tienda de referencia para zapatillas deportivas. Stock en tiempo real, gestión inteligente.
            </p>
            <p className="text-xs text-neutral-400 font-medium">
              Portfolio Project · Full-Stack Demo
            </p>
          </div>

          {/* Categorías */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Categorías</p>
            <ul className="space-y-2">
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <Link
                    href={`/?category=${cat.toUpperCase()}`}
                    className="text-sm text-neutral-600 hover:text-orange-500 transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Género */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Por género</p>
            <ul className="space-y-2">
              {GENDERS.map(g => (
                <li key={g}>
                  <Link
                    href={`/?gender=${g.toUpperCase()}`}
                    className="text-sm text-neutral-600 hover:text-orange-500 transition-colors"
                  >
                    {g}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mi cuenta */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Mi cuenta</p>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="text-sm text-neutral-600 hover:text-orange-500 transition-colors">
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-neutral-600 hover:text-orange-500 transition-colors">
                  Registrarse
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-sm text-neutral-600 hover:text-orange-500 transition-colors">
                  Mis pedidos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-neutral-400">
            © {new Date().getFullYear()} KicksControl. Proyecto de portfolio.
          </p>
          <div className="flex items-center gap-4 text-xs text-neutral-400">
            <span>Java · Spring Boot · Next.js · PostgreSQL</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
