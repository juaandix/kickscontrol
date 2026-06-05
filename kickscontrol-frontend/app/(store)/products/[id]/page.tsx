import type { Metadata } from 'next'
import { ProductDetailClient } from '@/components/catalog/ProductDetailClient'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8081'

async function getProduct(id: string) {
  try {
    const res = await fetch(`${API_URL}/api/products/${id}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    return {
      title: 'Producto no encontrado — KicksControl',
    }
  }

  const title = `${product.name} · ${product.brand} — KicksControl`
  const description = product.description
    ? `${product.description.slice(0, 150)}${product.description.length > 150 ? '…' : ''}`
    : `${product.name} de ${product.brand}. ${product.category} · ${product.basePrice.toFixed(2)} €`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: product.imageUrl ? [{ url: product.imageUrl, alt: product.name }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.imageUrl ? [product.imageUrl] : [],
    },
  }
}

export default async function ProductDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return <ProductDetailClient id={Number(id)} />
}
