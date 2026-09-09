/**
 * Le copertine sono di due tipi e vanno servite in due modi diversi.
 *
 * Gli SVG stanno in `public/` sotto `/images/`: sono già leggeri e una pipeline di
 * ottimizzazione non ha niente da togliere, quindi passano intatti come prima.
 *
 * I raster stanno in `src/assets/` sotto `/assets/`: passano da `astro:assets`, che in
 * build li ricodifica in AVIF e WebP e ne genera le varianti per il `srcset`. Il prefisso
 * nel frontmatter dice quale delle due strade prende l'immagine, così il percorso resta
 * leggibile e non c'è una convenzione nascosta da ricordare.
 */
import type { ImageMetadata } from 'astro';

const raster = import.meta.glob<{ default: ImageMetadata }>('../assets/projects/*.{png,jpg,jpeg,avif,webp}', {
	eager: true,
});

/** L'immagine importata se il percorso punta a `/assets/`, altrimenti niente: sta in `public/`. */
export function coverAsset(src: string): ImageMetadata | undefined {
	const nome = src.startsWith('/assets/projects/') ? src.slice('/assets/projects/'.length) : undefined;
	return nome ? raster[`../assets/projects/${nome}`]?.default : undefined;
}
