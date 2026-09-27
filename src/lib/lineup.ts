// Le schermate vere di PoliVerse per la fila di dispositivi (DeviceLineup): l'app nei simulatori,
// sui dati di esempio. Il Mac mostra la versione per iPad a tutto schermo, già piegata nel trapezio.
const screen = (name: string) => `/images/projects/poliverse/lineup/${name}.webp`;

export const poliverseScreens = { mac: screen('mac'), watch: screen('watch'), iphone: screen('iphone'), ipad: screen('ipad') };

export const poliverseScreensAlt = {
	en: 'PoliVerse on MacBook, Apple Watch, iPhone and iPad, on sample data: the career with its average on the Mac, the next exams on the watch, the Today tab on the iPhone and the courses on the iPad.',
	it: 'PoliVerse su MacBook, Apple Watch, iPhone e iPad, con i dati di esempio: la carriera con la media sul Mac, i prossimi esami sull’orologio, la scheda Oggi sull’iPhone e i corsi sull’iPad.',
};
