import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { MesaPlanoDto, ReservaDto } from '@cafe-lenca/shared';
import { api } from '../../lib/api';

export const usePlano = (fechaIso: string | null, personas: number) =>
  useQuery({
    queryKey: ['plano', fechaIso, personas],
    queryFn: () =>
      api<MesaPlanoDto[]>(
        `/reservas/plano?fecha=${encodeURIComponent(fechaIso ?? '')}&personas=${personas}`,
      ),
    enabled: fechaIso !== null,
    placeholderData: keepPreviousData,
    retry: false,
  });

export const useMisReservas = (correo: string | null) =>
  useQuery({
    queryKey: ['reservas', correo],
    queryFn: () => api<ReservaDto[]>(`/reservas?correo=${encodeURIComponent(correo ?? '')}`),
    enabled: !!correo,
    retry: false,
  });

export const useCrearReserva = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (datos: { correo: string; fecha: string; personas: number; mesaId?: number }) =>
      api<ReservaDto>('/reservas', { method: 'POST', body: JSON.stringify(datos) }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['reservas'] });
      void qc.invalidateQueries({ queryKey: ['plano'] });
    },
  });
};

export const useCancelarReserva = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (datos: { idReserva: number; correo: string }) =>
      api<ReservaDto>(`/reservas/${datos.idReserva}/cancelar`, {
        method: 'PATCH',
        body: JSON.stringify({ correo: datos.correo }),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['reservas'] });
      void qc.invalidateQueries({ queryKey: ['plano'] });
    },
  });
};