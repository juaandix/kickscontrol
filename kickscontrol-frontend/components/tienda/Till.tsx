'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchProducts } from '@/lib/products'
import { fetchTodaySales, lookupSku, looksLikeSku, ringUpSale, type PaymentMethod, type StoreSale } from '@/lib/store'
import { formatPrice } from '@/lib/sheet'
import type { Product, ProductVariant } from '@/types'
import { ProductSizes } from './ProductSizes'
import { MagnifyingGlassIcon, MinusIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface Line {
  variant: ProductVariant
  product: Product
  quantity: number
}

const unitPrice = (l: { product: Product; variant: ProductVariant }) => Number(l.product.basePrice) + Number(l.variant.priceModifier)

/** The till: scan or search on the left, the ticket and the payment on the right. */
export function Till() {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [picked, setPicked] = useState<Product | null>(null)
  const [lines, setLines] = useState<Line[]>([])
  const [method, setMethod] = useState<PaymentMethod>('CARD')
  const [cash, setCash] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<StoreSale | null>(null)

  // Search once typing pauses; a scanner's burst of characters ends in Enter and goes to lookup instead
  useEffect(() => {
    const t = setTimeout(() => setSearch(query.trim()), 250)
    return () => clearTimeout(t)
  }, [query])

  const results = useQuery({
    queryKey: ['till-search', search],
    queryFn: () => fetchProducts({ search, size_page: 12 }),
    enabled: search.length >= 2 && !looksLikeSku(search),
  })
  const today = useQuery({ queryKey: ['store-sales-today'], queryFn: fetchTodaySales })

  const total = lines.reduce((s, l) => s + unitPrice(l) * l.quantity, 0)
  const units = lines.reduce((s, l) => s + l.quantity, 0)
  const cashGiven = Number(cash.replace(',', '.')) || 0
  const change = cashGiven - total
  const canCharge = lines.length > 0 && (method === 'CARD' || cashGiven >= total)

  function inTicket(variantId: number) {
    return lines.find(l => l.variant.id === variantId)?.quantity ?? 0
  }

  function add(product: Product, variant: ProductVariant) {
    if (inTicket(variant.id) >= variant.stockQuantity) {
      setNotice(`No quedan más ${product.name} en talla ${variant.size} (${variant.color}).`)
      return
    }
    setNotice(null)
    setReceipt(null)
    setLines(prev => {
      const existing = prev.find(l => l.variant.id === variant.id)
      if (existing) return prev.map(l => (l === existing ? { ...l, quantity: l.quantity + 1 } : l))
      return [...prev, { product, variant, quantity: 1 }]
    })
  }

  function setQuantity(variantId: number, quantity: number) {
    setLines(prev => prev.flatMap(l => (l.variant.id !== variantId ? [l] : quantity <= 0 ? [] : [{ ...l, quantity: Math.min(quantity, l.variant.stockQuantity) }])))
  }

  const scan = useMutation({
    mutationFn: lookupSku,
    onSuccess: ({ variantId, product }) => {
      const variant = product.variants.find(v => v.id === variantId)
      if (variant) add(product, variant)
      setQuery('')
    },
    onError: () => setNotice(`No hay ninguna caja con el SKU «${query.trim().toUpperCase()}».`),
  })

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const text = query.trim()
    if (looksLikeSku(text)) scan.mutate(text)
    else if (results.data?.content.length === 1) setPicked(results.data.content[0])
  }

  const sale = useMutation({
    mutationFn: () =>
      ringUpSale({
        items: lines.map(l => ({ variantId: l.variant.id, quantity: l.quantity })),
        paymentMethod: method,
        cashGiven: method === 'CASH' ? cashGiven : undefined,
      }),
    onSuccess: s => {
      setReceipt(s)
      setLines([])
      setCash('')
      setPicked(null)
      setQuery('')
      setNotice(null)
      queryClient.invalidateQueries({ queryKey: ['till-search'] })
      queryClient.invalidateQueries({ queryKey: ['store-product'] })
      queryClient.invalidateQueries({ queryKey: ['store-sales-today'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (e: Error) => setNotice(e.message.includes('stock') ? 'Alguna talla del ticket se ha agotado mientras cobrabas. Revisa el stock.' : `No se pudo cobrar: ${e.message}`),
  })

  function newSale() {
    setReceipt(null)
    setMethod('CARD')
    inputRef.current?.focus()
  }

  return (
    <div className="grid h-full lg:grid-cols-[1fr_26rem]">
      {/* ── Left: find the box ── */}
      <section className="flex min-h-0 flex-col border-r border-form-rule">
        <form onSubmit={onSubmit} className="border-b border-form-rule p-4 sm:p-6">
          <label htmlFor="till-search" className="type-field mb-2 block">Escanea el código o busca por modelo</label>
          <div className="flex h-14 items-center gap-3 border-2 border-ink px-4 focus-within:shadow-[var(--lift-2)]">
            <MagnifyingGlassIcon className="size-5 shrink-0 text-ink-soft" />
            <input
              id="till-search"
              ref={inputRef}
              autoFocus
              autoComplete="off"
              value={query}
              onChange={e => { setQuery(e.target.value); setPicked(null) }}
              placeholder="NK-AM90-42-WB o «air max»"
              // The box around it carries the focus; the sheet's own ring would draw a second one inside
              style={{ outline: 'none' }}
              className="min-w-0 flex-1 bg-transparent font-[family-name:var(--font-label)] text-base outline-none focus-visible:outline-none placeholder:text-ink-soft/60"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); setPicked(null); inputRef.current?.focus() }} className="text-ink-soft hover:text-ink" aria-label="Borrar búsqueda">
                <XMarkIcon className="size-5" />
              </button>
            )}
          </div>
          {notice && <p role="status" className="mt-2 text-sm text-alarm">{notice}</p>}
        </form>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {picked ? (
            <ProductSizes
              product={picked}
              onPick={add}
              available={v => v.stockQuantity - inTicket(v.id)}
              onBack={() => setPicked(null)}
              backLabel="Resultados"
              hint="toca una para añadirla"
            />
          ) : search.length >= 2 && !looksLikeSku(search) ? (
            results.isPending ? (
              <p className="type-label text-ink-soft">Buscando…</p>
            ) : results.data?.content.length ? (
              <ul aria-label="Resultados" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {results.data.content.map(p => (
                  <li key={p.id}>
                    <button onClick={() => setPicked(p)} className="press group block w-full border border-form-rule text-left hover:border-ink">
                      <div className="tile aspect-[4/3] overflow-hidden">
                        {p.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imageUrl} alt="" className="on-paper size-full object-cover" />
                        )}
                      </div>
                      <div className="p-3">
                        <p className="truncate text-sm font-semibold">{p.name}</p>
                        <p className="type-label mt-0.5 flex justify-between text-ink-soft">
                          <span>{p.brand}</span>
                          <span>{p.totalStock ?? 0} uds</span>
                        </p>
                        <p className="mt-1 text-sm tabular-nums">{formatPrice(Number(p.basePrice))}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-soft">Nada en el almacén coincide con «{search}».</p>
            )
          ) : (
            <TodayPanel sales={today.data} />
          )}
        </div>
      </section>

      {/* ── Right: the ticket ── */}
      <aside className="flex min-h-0 flex-col bg-form-wash" aria-label="Ticket">
        {receipt ? (
          <Receipt sale={receipt} onNext={newSale} />
        ) : (
          <>
            <div className="flex items-baseline justify-between border-b border-ink px-5 py-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.02em]">Ticket</h2>
              <span className="type-label text-ink-soft">{units} {units === 1 ? 'ud' : 'uds'}</span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {lines.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-ink-soft">Escanea una caja para empezar la venta.</p>
              ) : (
                <ul className="divide-y divide-form-rule">
                  {lines.map(l => (
                    <li key={l.variant.id} className="px-5 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{l.product.name}</p>
                          <p className="type-label mt-0.5 text-ink-soft">Talla {l.variant.size} · {l.variant.color}</p>
                          <p className="type-label text-ink-soft/70">{l.variant.sku}</p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold tabular-nums">{formatPrice(unitPrice(l) * l.quantity)}</p>
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        <button onClick={() => setQuantity(l.variant.id, l.quantity - 1)} className="press flex size-9 items-center justify-center border border-form-rule bg-paper hover:border-ink" aria-label="Quitar una unidad">
                          <MinusIcon className="size-4" />
                        </button>
                        <span className="type-label w-9 text-center text-sm">{l.quantity}</span>
                        <button
                          onClick={() => setQuantity(l.variant.id, l.quantity + 1)}
                          disabled={l.quantity >= l.variant.stockQuantity}
                          className="press flex size-9 items-center justify-center border border-form-rule bg-paper hover:border-ink disabled:opacity-30"
                          aria-label="Añadir una unidad"
                        >
                          <PlusIcon className="size-4" />
                        </button>
                        <span className="type-label ml-2 text-ink-soft">{formatPrice(unitPrice(l))} / ud</span>
                        <button onClick={() => setQuantity(l.variant.id, 0)} className="type-label ml-auto text-ink-soft hover:text-alarm">Quitar</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-4 border-t border-ink bg-paper px-5 py-4">
              <div className="flex items-baseline justify-between">
                <span className="type-field">Total</span>
                <span className="type-name text-3xl tabular-nums">{formatPrice(total)}</span>
              </div>

              <div role="radiogroup" aria-label="Forma de pago" className="grid grid-cols-2 gap-1.5">
                {(['CARD', 'CASH'] as PaymentMethod[]).map(m => (
                  <button
                    key={m}
                    role="radio"
                    aria-checked={method === m}
                    onClick={() => setMethod(m)}
                    className={`press h-11 border text-sm font-semibold ${method === m ? 'border-ink bg-ink text-paper' : 'border-form-rule hover:border-ink'}`}
                  >
                    {m === 'CARD' ? 'Tarjeta' : 'Efectivo'}
                  </button>
                ))}
              </div>

              {method === 'CASH' && (
                <CashBox total={total} cash={cash} onCash={setCash} change={change} />
              )}

              <button
                onClick={() => sale.mutate()}
                disabled={!canCharge || sale.isPending}
                className="press h-14 w-full bg-ink text-base font-semibold text-paper hover:bg-form-deep disabled:bg-paper-deep disabled:text-ink-soft"
              >
                {sale.isPending ? 'Cobrando…' : lines.length ? `Cobrar ${formatPrice(total)}` : 'Cobrar'}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}

/** Cash handed over: exact amount or the next notes up, and the change to give back. */
function CashBox({ total, cash, onCash, change }: { total: number; cash: string; onCash: (v: string) => void; change: number }) {
  const notes = [...new Set([total, ...[5, 10, 20, 50, 100].map(n => Math.ceil(total / n) * n)])]
    .filter(n => n >= total && n > 0)
    .sort((a, b) => a - b)
    .slice(0, 4)

  return (
    <div className="space-y-2">
      <label htmlFor="till-cash" className="type-field block">Entregado</label>
      <input
        id="till-cash"
        inputMode="decimal"
        value={cash}
        onChange={e => onCash(e.target.value)}
        placeholder="0,00"
        className="h-11 w-full border border-form-rule bg-paper px-3 text-right text-lg tabular-nums focus:border-ink focus:outline-none"
      />
      <div className="flex flex-wrap gap-1.5">
        {notes.map(n => (
          <button key={n} type="button" onClick={() => onCash(n.toFixed(2))} className="press type-label h-9 border border-form-rule bg-paper px-2.5 hover:border-ink">
            {n === total ? 'Exacto' : formatPrice(n)}
          </button>
        ))}
      </div>
      {cash && (
        <p className={`flex items-baseline justify-between ${change < 0 ? 'text-alarm' : ''}`}>
          <span className="type-field">{change < 0 ? 'Falta' : 'Cambio'}</span>
          <span className="text-xl font-semibold tabular-nums">{formatPrice(Math.abs(change))}</span>
        </p>
      )}
    </div>
  )
}

function Receipt({ sale, onNext }: { sale: StoreSale; onNext: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-ink px-5 py-4">
        <p className="type-label text-ink-soft">Venta #{sale.id} · {sale.paymentMethod === 'CASH' ? 'Efectivo' : 'Tarjeta'}</p>
        <h2 className="type-name mt-1 text-2xl">Cobrado</h2>
      </div>
      <ul className="min-h-0 flex-1 divide-y divide-form-rule overflow-y-auto">
        {sale.items.map(it => (
          <li key={it.id} className="flex justify-between gap-3 px-5 py-2.5 text-sm">
            <span className="min-w-0">
              <span className="block truncate">{it.quantity} × {it.productName}</span>
              <span className="type-label text-ink-soft">Talla {it.size} · {it.color}</span>
            </span>
            <span className="tabular-nums">{formatPrice(Number(it.subtotal))}</span>
          </li>
        ))}
      </ul>
      <dl className="space-y-1.5 border-t border-ink bg-paper px-5 py-4 text-sm">
        <div className="flex justify-between"><dt className="type-field">Total</dt><dd className="text-lg font-semibold tabular-nums">{formatPrice(Number(sale.totalAmount))}</dd></div>
        {sale.cashGiven != null && (
          <>
            <div className="flex justify-between"><dt className="type-field">Entregado</dt><dd className="tabular-nums">{formatPrice(Number(sale.cashGiven))}</dd></div>
            <div className="flex justify-between"><dt className="type-field">Cambio</dt><dd className="type-name text-3xl tabular-nums">{formatPrice(Number(sale.change ?? 0))}</dd></div>
          </>
        )}
        <p className="type-label pt-1 text-ink-soft">Atendido por {sale.soldBy}</p>
        <button onClick={onNext} autoFocus className="press mt-3 h-14 w-full bg-ink text-base font-semibold text-paper hover:bg-form-deep">Nueva venta</button>
      </dl>
    </div>
  )
}

/** What the till has rung up today, when nothing is being searched. */
function TodayPanel({ sales }: { sales?: StoreSale[] }) {
  if (!sales) return null
  const total = sales.reduce((s, x) => s + Number(x.totalAmount), 0)
  const cash = sales.filter(s => s.paymentMethod === 'CASH').reduce((s, x) => s + Number(x.totalAmount), 0)

  return (
    <div>
      <p className="type-label text-ink-soft">Hoy en caja</p>
      <div className="mt-3 grid grid-cols-3 gap-px border border-form-rule bg-form-rule">
        {[
          ['Ventas', String(sales.length)],
          ['Facturado', formatPrice(total)],
          ['En efectivo', formatPrice(cash)],
        ].map(([k, v]) => (
          <div key={k} className="bg-paper px-4 py-3">
            <p className="type-field">{k}</p>
            <p className="type-name mt-1 text-2xl tabular-nums">{v}</p>
          </div>
        ))}
      </div>
      {sales.length > 0 && (
        <ul className="mt-6 divide-y divide-form-rule border-y border-form-rule">
          {sales.slice(0, 8).map(s => (
            <li key={s.id} className="grid grid-cols-[4rem_1fr_auto] items-baseline gap-3 py-2 text-sm">
              <span className="type-label text-ink-soft">{new Date(s.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="truncate">
                {s.items[0]?.productName}{s.items.length > 1 && <span className="text-ink-soft"> y {s.items.length - 1} más</span>}
                <span className="text-ink-soft"> · {s.soldBy}</span>
              </span>
              <span className="tabular-nums">{formatPrice(Number(s.totalAmount))}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
