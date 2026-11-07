const moneda = new Intl.NumberFormat('es-HN', { style: 'currency', currency: 'HNL' });
export const lempiras = (n: number): string => moneda.format(n);

// "Café" -> "cafe": permite buscar sin importar acentos ni mayúsculas
export const normalizar = (t: string): string =>
  t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const fechaHoraFmt = new Intl.DateTimeFormat('es-HN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: 'numeric',
  minute: '2-digit',
});
export const fechaHora = (iso: string): string => fechaHoraFmt.format(new Date(iso));

const mesAnioFmt = new Intl.DateTimeFormat('es-HN', { month: 'long', year: 'numeric' });
export const mesAnio = (iso: string): string => mesAnioFmt.format(new Date(iso));

const mesCortoFmt = new Intl.DateTimeFormat('es-HN', { month: 'short' });
// "2026-11" -> "nov"
export const mesCorto = (aaaaMm: string): string => mesCortoFmt.format(new Date(`${aaaaMm}-01T12:00:00`));