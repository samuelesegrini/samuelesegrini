/**
 * Le immagini dei contenuti sono scritte con percorsi radicati alla radice (/images/...).
 * Su GitHub Pages il sito vive sotto un prefisso: questo plugin lo aggiunge in fase di build,
 * sia alle immagini Markdown sia ai tag <img> scritti come HTML dentro gli MDX.
 */
export default function rehypeBaseImages() {
	const base = (process.env.BASE_URL ?? '').replace(/\/$/, '');
	if (!base) return () => {};
	const visita = (nodo) => {
		if (nodo.type === 'element' && nodo.tagName === 'img' && nodo.properties?.src?.startsWith('/')) {
			nodo.properties.src = base + nodo.properties.src;
		}
		if ((nodo.type === 'mdxJsxFlowElement' || nodo.type === 'mdxJsxTextElement') && nodo.name === 'img') {
			for (const attributo of nodo.attributes ?? []) {
				if (attributo.name === 'src' && typeof attributo.value === 'string' && attributo.value.startsWith('/')) attributo.value = base + attributo.value;
			}
		}
		nodo.children?.forEach(visita);
	};
	return (albero) => visita(albero);
}
