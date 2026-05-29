import { BackofficeSidebar } from '@/components/backoffice/BackofficeSidebar'

export const metadata = { title: 'Backoffice — KicksControl' }

export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-100">
      <BackofficeSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
