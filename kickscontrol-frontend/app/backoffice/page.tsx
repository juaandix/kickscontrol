'use client'

import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { CubeIcon, ChartBarIcon } from '@heroicons/react/24/outline'

export default function BackofficePage() {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-neutral-900">
          Bienvenido, {user?.firstName} 👋
        </h1>
        <p className="text-neutral-500 mt-1">Panel de gestión de KicksControl</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/backoffice/inventory"
          className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-md transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <CubeIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="font-bold text-neutral-900 group-hover:text-orange-600">Inventario</p>
              <p className="text-sm text-neutral-500">Gestión de productos y variantes</p>
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-2xl border border-neutral-200 p-6 opacity-60 cursor-not-allowed">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-neutral-900">KPI Dashboard</p>
              <p className="text-sm text-neutral-500">Disponible en Sprint 4</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
