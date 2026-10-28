import { Till } from '@/components/tienda/Till'
import { StaffOnly } from '@/components/tienda/StoreShell'

export const metadata = { title: 'Caja — KicksControl' }

export default function CajaPage() {
  return (
    <StaffOnly>
      <Till />
    </StaffOnly>
  )
}
