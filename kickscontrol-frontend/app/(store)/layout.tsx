import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="sheet flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-[90rem] flex-1 px-4 pt-4 pb-16 sm:px-6 lg:px-10">
        {children}
      </main>
      <Footer />
    </div>
  )
}
