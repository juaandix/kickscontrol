import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ToneShell } from '@/components/layout/ToneShell'
import { StockTicker } from '@/components/layout/StockTicker'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToneShell>
      <StockTicker />
      <Header />
      <main className="mx-auto w-full max-w-[90rem] flex-1 px-4 pt-4 pb-16 sm:px-6 lg:px-10">
        {children}
      </main>
      <Footer />
    </ToneShell>
  )
}
