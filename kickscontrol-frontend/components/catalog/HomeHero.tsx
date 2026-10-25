import { VideoHero } from './VideoHero'

/** Street footage behind the store's promise. */
export function HomeHero() {
  return (
    <VideoHero
      video="/media/hero-street.mp4"
      poster="/media/hero-street.jpg"
      title="Zapatillas con stock real por talla y color"
      subtitle="Running, basketball, lifestyle y skate. Lo que ves disponible, está en el almacén."
      cta="Ver colección"
      target="catalog"
    />
  )
}
