// Horario de atención. Ajusta estas constantes al horario real de Café Lenca.
export const HORA_APERTURA = 8;
export const HORA_CIERRE = 20; // la última reserva es a las 19:30

// Mismas reglas de antelación que valida la API
export const ANTELACION_MIN = 60;
export const DIAS_MAX = 30;

const dos = (n: number): string => String(n).padStart(2, '0');

export const aFechaLocal = (d: Date): string =>
  `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;

export const franjas = (): string[] =>
  Array.from({ length: (HORA_CIERRE - HORA_APERTURA) * 2 }, (_, i) => {
    const hora = HORA_APERTURA + Math.floor(i / 2);
    return `${dos(hora)}:${i % 2 === 0 ? '00' : '30'}`;
  });

// "2026-11-20" + "19:30" -> Date en la hora local del cliente
export const combinar = (fecha: string, hora: string): Date => {
  const [y, m, d] = fecha.split('-').map(Number);
  const [h, min] = hora.split(':').map(Number);
  return new Date(y, m - 1, d, h, min);
};

export const franjaValida = (fecha: string, hora: string, ahora: Date = new Date()): boolean => {
  const minutos = (combinar(fecha, hora).getTime() - ahora.getTime()) / 60_000;
  return minutos >= ANTELACION_MIN && minutos <= DIAS_MAX * 24 * 60;
};

// Hoy si todavía quedan horarios disponibles; si no, mañana
export const fechaInicial = (): string => {
  const hoy = new Date();
  const hayHoy = franjas().some((h) => franjaValida(aFechaLocal(hoy), h));
  return aFechaLocal(hayHoy ? hoy : new Date(hoy.getTime() + 86_400_000));
};