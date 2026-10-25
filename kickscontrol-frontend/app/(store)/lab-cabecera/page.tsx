'use client'

// Temporary comparison page for the home hero motion. Delete after choosing.
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { fetchProducts } from '@/lib/products'
import { productImage, rawImage } from '@/lib/sheet'

const VARIANTS = [
  { id: 'still', title: '1 · Quieta (como SVD)', note: 'Entra una vez con fundido y leve subida, y se queda quieta.' },
  { id: 'turntable', title: '2 · Plato giratorio', note: 'Balanceo 3D continuo de ±15°; la sombra acompaña. Nunca enseña el canto.' },
  { id: 'spin', title: '5 · Giro plano 360°', note: 'Rotación completa continua de la foto: efecto cromo (se afina y sale en espejo).' },
]

export default function HeroLab() {
  const { data } = useQuery({ queryKey: ['products', 'featured-page'], queryFn: () => fetchProducts({ page: 0, size_page: 1 }) })
  const p = data?.content[0]

  return (
    <div className="py-10">
      <style>{`
        .lab-stage { position: relative; aspect-ratio: 4 / 3; background: var(--paper); perspective: 1100px; overflow: hidden; }
        .lab-shoe { position: absolute; inset: 8% 6% 16%; }
        .lab-shadow { position: absolute; left: 24%; right: 24%; bottom: 12%; height: 6%; border-radius: 50%;
          background: radial-gradient(closest-side, rgba(17,17,17,.22), transparent); }
        .v-still .lab-shoe { animation: lab-in 900ms cubic-bezier(.16,1,.3,1) 200ms both; }
        @keyframes lab-in { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        .v-turntable .lab-shoe { animation: lab-sway 7s ease-in-out infinite; transform-style: preserve-3d; }
        .v-turntable .lab-shadow { animation: lab-shadow 7s ease-in-out infinite; }
        @keyframes lab-sway { 0%,100% { transform: rotateY(-15deg); } 50% { transform: rotateY(15deg); } }
        @keyframes lab-shadow { 0%,100% { transform: translateX(-3%) scaleX(.94); } 50% { transform: translateX(3%) scaleX(.94); } 25%,75% { transform: scaleX(1); } }
        .v-spin .lab-shoe { animation: lab-spin 6s linear infinite; }
        .v-spin .lab-shadow { animation: lab-spin-shadow 3s ease-in-out infinite; }
        @keyframes lab-spin { to { transform: rotateY(360deg); } }
        @keyframes lab-spin-shadow { 0%,100% { transform: scaleX(1); } 50% { transform: scaleX(.35); } }
        @media (prefers-reduced-motion: reduce) { .lab-shoe, .lab-shadow { animation: none !important; } }
      `}</style>

      <h1 className="type-name text-[clamp(2rem,3.5vw,2.75rem)]">Animación de la cabecera</h1>
      <p className="mt-2 text-sm text-ink-soft">Página temporal para comparar. Recarga para volver a ver la entrada de la opción 1.</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        {VARIANTS.map(v => (
          <section key={v.id}>
            <div className={`lab-stage v-${v.id} border border-form-rule`}>
              <span className="lab-shadow" aria-hidden />
              {p?.imageUrl && (
                <div className="lab-shoe">
                  <Image src={productImage(p.imageUrl)} alt={p.name} fill unoptimized={rawImage(p.imageUrl)} sizes="33vw" className="object-contain" />
                </div>
              )}
            </div>
            <h2 className="mt-4 font-semibold">{v.title}</h2>
            <p className="mt-1 text-sm text-ink-soft">{v.note}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
