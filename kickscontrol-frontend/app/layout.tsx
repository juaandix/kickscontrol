import type { Metadata } from 'next'
import { Archivo, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { QueryProvider } from '@/context/QueryProvider'
import { CartProvider } from '@/context/CartContext'

const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo' })
// Shoebox labels and stock counts: references, SKUs and units read like a warehouse printout
const label = JetBrains_Mono({ subsets: ['latin'], variable: '--font-label' })

export const metadata: Metadata = {
  title: 'KicksControl',
  description: 'E-Commerce & Smart Backoffice for sportswear',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${archivo.variable} ${label.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        <QueryProvider>
          <AuthProvider>
            <CartProvider>{children}</CartProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
