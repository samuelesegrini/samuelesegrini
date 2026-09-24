/**
 * Nomi unici per i gruppi di scelta dei racconti (radio, ancore delle note): due FeatureExplorer
 * nella stessa pagina non devono condividere il gruppo, o sceglierne uno spegnerebbe l'altro.
 */
let contatore = 0;
export const storyId = (prefisso: string) => `${prefisso}-${(++contatore).toString(36)}`;
