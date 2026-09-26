/**
 * La lingua di un racconto, letta dall'indirizzo della pagina: le pagine italiane stanno sotto /it/.
 * Serve ai componenti per le poche parole che scrivono da sé (pulsanti, etichette per i lettori di
 * schermo); tutto il resto del testo arriva già tradotto dalla pagina.
 */
export type StoryLang = 'it' | 'en';

export const storyLang = (url: URL): StoryLang => (/\/it(\/|$)/.test(url.pathname) ? 'it' : 'en');
