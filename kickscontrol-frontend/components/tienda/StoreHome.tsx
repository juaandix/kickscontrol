'use client'

import Link from 'next/link'
import { ArrowRightIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { useIsStaff } from './StoreShell'

const DOORS = [
  { href: '/tienda/catalogo', code: '01', title: 'Catálogo', text: 'Todos los modelos y las tallas que quedan en el almacén.', staff: false },
  { href: '/tienda/caja', code: '02', title: 'Caja', text: 'Escanea, cobra en tarjeta o efectivo y entrega el ticket.', staff: true },
  { href: '/tienda/inventario', code: '03', title: 'Inventario', text: 'Stock por talla y color, reposición y ajustes.', staff: true },
]

/** The store's front screen: three doors, the staff ones behind a sign-in. */
export function StoreHome() {
  const isStaff = useIsStaff()

  return (
    <div className="mx-auto flex min-h-full max-w-6xl flex-col justify-center px-4 py-10 sm:px-6">
      <p className="type-label text-ink-soft">KicksControl · tienda física</p>
      <h1 className="type-name mt-2 text-[2.5rem] sm:text-[3.5rem]">¿Qué necesitas?</h1>

      <ul className="mt-8 grid gap-3 md:grid-cols-3">
        {DOORS.map(d => {
          const locked = d.staff && !isStaff
          return (
            <li key={d.href}>
              <Link
                href={d.href}
                className="press group flex h-full min-h-56 flex-col border border-ink p-6 hover:bg-ink hover:text-paper"
              >
                <span className="flex items-center justify-between">
                  <span className="type-label opacity-60">{d.code}</span>
                  {locked && (
                    <span className="type-label flex items-center gap-1 opacity-60">
                      <LockClosedIcon className="size-3.5" />
                      Personal
                    </span>
                  )}
                </span>
                <span className="type-name mt-auto text-4xl">{d.title}</span>
                <span className="mt-2 text-sm opacity-70">{d.text}</span>
                <span className="mt-4 flex items-center gap-1.5 text-sm font-semibold">
                  {locked ? 'Iniciar sesión' : 'Entrar'}
                  <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
