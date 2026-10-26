import { VideoHero } from './VideoHero'

/** Street footage behind the store's promise. */
export function HomeHero() {
  return (
    <VideoHero
      video="/media/hero-street.mp4"
      poster="/media/hero-street.jpg"
      title="Lo que ves, está en el almacén."
      subtitle="Zapatillas y ropa de running, basketball, lifestyle y skate, con el stock real de cada talla y color contado al momento."
      cta="Ver colección"
      target="catalog"
    />
  )
}
