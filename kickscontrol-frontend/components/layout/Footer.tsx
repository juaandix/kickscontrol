import Link from 'next/link'
import { categoryHref } from '@/lib/categories'
import { Wordmark } from '@/components/brand/Wordmark'

const CATEGORIES = ['Running', 'Basketball', 'Lifestyle', 'Skateboarding']
const linkClass = 'text-ink-soft hover:text-ink'

/** Who built the store and why it counts stock the way it does, where to go next, and the fine print. */
export function Footer() {
  return (
    <footer className="mt-auto border-t border-form-rule">
      <div className="mx-auto grid max-w-[90rem] gap-10 px-4 py-12 sm:px-6 md:grid-cols-12 lg:px-10">
        <div className="md:col-span-7">
          <Wordmark />
          <p className="type-name mt-6 max-w-xl text-[clamp(1.5rem,2.6vw,2.25rem)]">Hecha por quien cerraba la caja.</p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
            KicksControl la diseñó y programó Juan David Gil, ex Shift Leader en Foot Locker. El stock por talla y color,
            la protección contra vender un par que ya no está y los indicadores de turno vienen de años en el suelo de tienda.
          </p>
        </div>
        <nav aria-label="Pie" className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:col-span-5 md:justify-self-end">
          <p className="type-label col-span-2 pb-1 text-ink-soft">Secciones</p>
          {CATEGORIES.map(cat => (
            <Link key={cat} href={categoryHref(cat)} className={linkClass}>{cat}</Link>
          ))}
          <Link href="/?type=APPAREL#catalog" className={linkClass}>Ropa</Link>
          <Link href="/orders" className={linkClass}>Mis pedidos</Link>
          <Link href="/profile" className={linkClass}>Mi cuenta</Link>
        </nav>
      </div>
      <p className="type-label mx-auto max-w-[90rem] border-t border-dashed border-form-rule px-4 py-4 text-ink-soft sm:px-6 lg:px-10">
        © {new Date().getFullYear()} KicksControl · Proyecto de portfolio de Juan David Gil · Pagos simulados, sin envíos reales
      </p>
    </footer>
  )
}
