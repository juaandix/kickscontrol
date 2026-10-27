'use client'

import { useState, type FormEvent } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminFetchUsers, adminCreateUser, adminDeleteUser, type CreateUserDto } from '@/lib/admin'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/context/AuthContext'
import { FormError, Modal, PageHead, Skeleton, btnGhost, btnIcon, btnPrimary, inputCls, labelCls } from '@/components/backoffice/ui'

const ROLE_LABELS: Record<string, string> = {
  USER: 'Cliente', ADMIN: 'Admin', SHIFT_LEADER: 'Shift Leader',
}

const emptyForm = (): CreateUserDto => ({
  email: '', password: '', firstName: '', lastName: '', role: 'SHIFT_LEADER',
})

export default function UsersPage() {
  const queryClient = useQueryClient()
  const { user: me } = useAuth()
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

  function closeForm() {
    setShowForm(false)
    setFormError(null)
  }

  const staff = users.filter(u => u.role !== 'USER').length

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!form.email || !form.password || !form.firstName || !form.lastName) {
      setFormError('Todos los campos son obligatorios.')
      return
    }
    createMutation.mutate(form)
  }

  return (
    <div className="space-y-6">
      <PageHead kicker={`${users.length} cuentas · ${staff} de personal`} title="Usuarios">
        <button onClick={() => setShowForm(true)} className={btnPrimary}>
          <PlusIcon className="size-4" />
          Nuevo usuario
        </button>
      </PageHead>

      {isLoading ? (
        <div className="space-y-px">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
        </div>
      ) : (
        <div className="overflow-x-auto border-t border-ink">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-form-rule text-left">
                <th className="type-field py-2.5 pr-3 font-semibold">Usuario</th>
                <th className="type-field hidden px-3 py-2.5 font-semibold md:table-cell">Email</th>
                <th className="type-field px-3 py-2.5 font-semibold">Rol</th>
                <th className="type-field hidden px-3 py-2.5 font-semibold lg:table-cell">Alta</th>
                <th className="py-2.5 pl-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-form-rule">
              {users.map(user => {
                const isMe = me?.id === user.id
                return (
                  <tr key={user.id} className="hover:bg-form-wash">
                    <td className="py-3 pr-3">
                      <p className="font-semibold">
                        {user.firstName} {user.lastName}
                        {isMe && <span className="type-label ml-2 font-normal text-ink-soft">Tú</span>}
                      </p>
                      <p className="truncate text-xs text-ink-soft md:hidden">{user.email}</p>
                    </td>
                    <td className="hidden px-3 py-3 text-ink-soft md:table-cell">{user.email}</td>
                    <td className="px-3 py-3">
                      <span className={`type-label inline-block px-2 py-1 ${user.role === 'USER' ? 'text-ink-soft' : 'bg-ink text-paper'}`}>
                        {ROLE_LABELS[user.role] ?? user.role}
                      </span>
                    </td>
                    <td className="type-label hidden px-3 py-3 text-ink-soft lg:table-cell">
                      {new Date(user.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 pl-3 text-right">
                      {/* Deleting your own account would lock you out mid-shift */}
                      {!isMe && (
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar a ${user.firstName} ${user.lastName}?`)) deleteMutation.mutate(user.id)
                          }}
                          className={`${btnIcon} hover:text-alarm`}
                          title="Eliminar usuario"
                          aria-label={`Eliminar a ${user.firstName} ${user.lastName}`}
                        >
                          <TrashIcon className="size-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {users.length === 0 && <p className="py-12 text-center text-sm text-ink-soft">No hay usuarios</p>}
        </div>
      )}

      {showForm && (
        <Modal title="Nuevo usuario" kicker="Alta de cuenta" onClose={closeForm}>
          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto px-5 py-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="uf-first" className={labelCls}>Nombre *</label>
                <input id="uf-first" type="text" value={form.firstName} onChange={e => setField('firstName', e.target.value)} placeholder="Juan" className={inputCls} />
              </div>
              <div>
                <label htmlFor="uf-last" className={labelCls}>Apellidos *</label>
                <input id="uf-last" type="text" value={form.lastName} onChange={e => setField('lastName', e.target.value)} placeholder="García" className={inputCls} />
              </div>
            </div>
            <div>
              <label htmlFor="uf-email" className={labelCls}>Email *</label>
              <input id="uf-email" type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="juan@kickscontrol.com" className={inputCls} />
            </div>
            <div>
              <label htmlFor="uf-password" className={labelCls}>Contraseña *</label>
              <input id="uf-password" type="password" value={form.password} onChange={e => setField('password', e.target.value)} placeholder="Mínimo 6 caracteres" className={inputCls} />
            </div>
            <fieldset>
              <legend className={labelCls}>Rol</legend>
              <div className="grid grid-cols-3 gap-1.5">
                {(['SHIFT_LEADER', 'ADMIN', 'USER'] as const).map(r => (
                  <label key={r} className={`press flex h-10 cursor-pointer items-center justify-center border text-sm font-medium ${form.role === r ? 'border-ink bg-ink text-paper' : 'border-form-rule hover:border-ink'}`}>
                    <input type="radio" name="role" value={r} checked={form.role === r} onChange={() => setField('role', r)} className="sr-only" />
                    {ROLE_LABELS[r]}
                  </label>
                ))}
              </div>
            </fieldset>

            {formError && <FormError>{formError}</FormError>}

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={closeForm} className={btnGhost}>Cancelar</button>
              <button type="submit" disabled={createMutation.isPending} className={btnPrimary}>
                {createMutation.isPending ? 'Creando…' : 'Crear usuario'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
