/**
 * PARADIGMA: Funcional
 * Cumple: validaciones automáticas como funciones puras (sin efectos ni
 *         estado externo), inmutabilidad, filter/some/map y composición.
 * Usado en: GET /reservas/mesas-disponibles, POST /reservas, PATCH /reservas/:id/cancelar
 */
import { ESTADO_ACTIVO } from '../../common/constants/estado';
import type { Mesa } from '../mesas/mesa.entity';

export const DURACION_RESERVA_MIN = 120;
export const ANTELACION_MINIMA_MIN = 60;
export const ANTELACION_MAXIMA_DIAS = 30;
export const CANCELACION_MINIMA_MIN = 60;

const MS_POR_MIN = 60_000;

export interface ReservaExistente {
  mesaId: number;
  fecha: Date;
}

// Devuelve el mensaje de error, o null si la fecha es válida
export const validarFecha = (fecha: Date, ahora: Date): string | null => {
  if (Number.isNaN(fecha.getTime())) {
    return 'La fecha no es válida';
  }
  const minutos = (fecha.getTime() - ahora.getTime()) / MS_POR_MIN;
  if (minutos < ANTELACION_MINIMA_MIN) {
    return `La reserva debe hacerse con al menos ${ANTELACION_MINIMA_MIN} minutos de antelación`;
  }
  if (minutos > ANTELACION_MAXIMA_DIAS * 24 * 60) {
    return `Solo se puede reservar con un máximo de ${ANTELACION_MAXIMA_DIAS} días de antelación`;
  }
  return null;
};

// Dos reservas chocan si empiezan con menos de la duración de diferencia
export const hayConflicto = (fecha: Date, existentes: readonly Date[]): boolean =>
  existentes.some(
    (otra) => Math.abs(otra.getTime() - fecha.getTime()) < DURACION_RESERVA_MIN * MS_POR_MIN,
  );

// Composición de filtros; la más pequeña que alcanza queda primera
export const mesasLibres = (
  mesas: readonly Mesa[],
  reservas: readonly ReservaExistente[],
  fecha: Date,
  personas: number,
): Mesa[] =>
  mesas
    .filter((m) => m.estado === ESTADO_ACTIVO)
    .filter((m) => m.capacidad >= personas)
    .filter(
      (m) =>
        !hayConflicto(
          fecha,
          reservas.filter((r) => r.mesaId === m.idMesa).map((r) => r.fecha),
        ),
    )
    .sort((a, b) => a.capacidad - b.capacidad || a.numero - b.numero);

export const puedeCancelar = (fechaReserva: Date, ahora: Date): boolean =>
  (fechaReserva.getTime() - ahora.getTime()) / MS_POR_MIN >= CANCELACION_MINIMA_MIN;