import { StoreShell } from '@/components/tienda/StoreShell'

export const metadata = { title: 'Tienda — KicksControl' }

/** Store mode: the physical shop's screens. Home and catalog are open; till and stock are staff only. */
export default function TiendaLayout({ children }: { children: React.ReactNode }) {
  return <StoreShell>{children}</StoreShell>
}
