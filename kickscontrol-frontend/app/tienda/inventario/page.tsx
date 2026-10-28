import InventoryPage from '@/app/backoffice/inventory/page'
import { StaffOnly } from '@/components/tienda/StoreShell'

export const metadata = { title: 'Inventario — KicksControl' }

/** The backoffice inventory, opened from the store without leaving store mode. */
export default function TiendaInventarioPage() {
  return (
    <StaffOnly>
      <div className="mx-auto max-w-[80rem] px-4 pt-6 pb-16 sm:px-6 lg:px-10">
        <InventoryPage />
      </div>
    </StaffOnly>
  )
}
