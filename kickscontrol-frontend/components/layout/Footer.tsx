import Link from 'next/link'
import { categoryHref } from '@/lib/categories'

const CATEGORIES = ['Running', 'Basketball', 'Lifestyle', 'Skateboarding']
const linkClass = 'text-ink-soft hover:text-ink'

/** Where to go next, and the fine print. */
export function Footer() {
  return (
    <footer className="mt-auto border-t border-form-rule">
      <div className="mx-auto flex max-w-[90rem] flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between lg:px-10">
        <p className="text-[1.375rem] font-extrabold tracking-[-0.04em]">KICKSCONTROL</p>
        <nav aria-label="Pie" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {CATEGORIES.map(cat => (
            <Link key={cat} href={categoryHref(cat)} className={linkClass}>{cat}</Link>
          ))}
          <Link href="/orders" className={linkClass}>Mis pedidos</Link>
          <Link href="/profile" className={linkClass}>Mi cuenta</Link>
        </nav>
      </div>
      <p className="mx-auto max-w-[90rem] px-4 pb-8 text-xs text-ink-soft sm:px-6 lg:px-10">
        © {new Date().getFullYear()} KicksControl · Proyecto de portfolio de Juan David Gil. Pagos simulados, sin envíos reales.
      </p>
    </footer>
  )
}
