'use client'

import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminFetchUsers, adminCreateUser, adminDeleteUser, type CreateUserDto } from '@/lib/admin'
import { PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'

const ROLE_COLORS: Record<string, string> = {
  USER:         'bg-blue-100 text-blue-700',
  ADMIN:        'bg-red-100 text-red-700',
  SHIFT_LEADER: 'bg-purple-100 text-purple-700',
}

const ROLE_LABELS: Record<string, string> = {
  USER: 'Cliente', ADMIN: 'Admin', SHIFT_LEADER: 'Shift Leader',
}

const emptyForm = (): CreateUserDto => ({
  email: '', password: '', firstName: '', lastName: '', role: 'SHIFT_LEADER',
})

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateUserDto>(emptyForm())
  const [formError, setFormError] = useState<string | null>(null)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminFetchUsers,
  })

  const createMutation = useMutation({
    mutationFn: adminCreateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      setShowForm(false)
      setForm(emptyForm())
      setFormError(null)
    },
    onError: (e: Error) => setFormError(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: adminDeleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  function setField(k: keyof CreateUserDto, v: string) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!form.email || !form.password || !form.firstName || !form.lastName) {
      setFormError('Todos los campos son obligatorios.')
      return
    }
    createMutation.mutate(form)
  }

  const inputCls = 'w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400'
  const labelCls = 'block text-xs font-semibold text-neutral-600 uppercase tracking-wide mb-1'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900">Usuarios</h1>
          <p className="text-sm text-neutral-500">{users.length} usuarios registrados</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Nuevo usuario
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-neutral-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Usuario</th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600 hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600">Rol</th>
                <th className="text-left px-4 py-3 font-semibold text-neutral-600 hidden lg:table-cell">Registro</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-black shrink-0">
                        {user.firstName[0]}{user.lastName[0]}
                      </div>
                      <span className="font-medium text-neutral-900">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-500 hidden md:table-cell">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ROLE_COLORS[user.role] ?? 'bg-neutral-100 text-neutral-600'}`}>
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-400 text-xs hidden lg:table-cell">
                    {new Date(user.createdAt).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar a ${user.firstName} ${user.lastName}?`)) {
                          deleteMutation.mutate(user.id)
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
                      title="Eliminar usuario"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && users.length === 0 && (
          <div className="py-12 text-center text-neutral-400 text-sm">No hay usuarios</div>
        )}
      </div>

      {/* Create user modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <h2 className="text-lg font-black text-neutral-900">Nuevo usuario</h2>
              <button onClick={() => { setShowForm(false); setFormError(null) }} className="p-2 rounded-lg hover:bg-neutral-100">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Nombre *</label>
                  <input type="text" value={form.firstName} onChange={e => setField('firstName', e.target.value)} placeholder="Juan" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Apellidos *</label>
                  <input type="text" value={form.lastName} onChange={e => setField('lastName', e.target.value)} placeholder="García" className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Email *</label>
                <input type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="juan@kickscontrol.com" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Contraseña *</label>
                <input type="password" value={form.password} onChange={e => setField('password', e.target.value)} placeholder="Mínimo 6 caracteres" className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Rol</label>
                <select value={form.role} onChange={e => setField('role', e.target.value)} className={inputCls}>
                  <option value="USER">Cliente (USER)</option>
                  <option value="SHIFT_LEADER">Shift Leader</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              {formError && (
                <p className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{formError}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setFormError(null) }} className="px-4 py-2.5 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 rounded-xl">
                  Cancelar
                </button>
                <button type="submit" disabled={createMutation.isPending} className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-colors">
                  {createMutation.isPending ? 'Creando...' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
