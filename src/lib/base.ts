/**
 * Il sito vive sotto un prefisso su GitHub Pages (/samuelesegrini/). Ogni collegamento e
 * ogni risorsa interna passano da qui, così in locale il prefisso è vuoto e in produzione
 * arriva da BASE_URL senza toccare i componenti.
 */
export const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const withBase = (path: string) => (path.startsWith('/') ? `${base}${path}` : path);
