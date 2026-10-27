import { BackofficeSidebar } from '@/components/backoffice/BackofficeSidebar'

export const metadata = { title: 'Trastienda — KicksControl' }

/** The store's backroom: the same white sheet and lettering, with a rail of its own. */
export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="sheet flex min-h-screen flex-col lg:flex-row">
      <BackofficeSidebar />
      <main className="min-w-0 flex-1 px-4 pt-6 pb-16 sm:px-6 lg:px-10 lg:pt-8">
        <div className="mx-auto max-w-[80rem]">{children}</div>
      </main>
    </div>
  )
}
