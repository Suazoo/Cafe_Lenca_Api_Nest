import { useMutation, useQuery } from '@tanstack/react-query';
import type { BaristaRespuestaDto, MensajeBaristaDto } from '@cafe-lenca/shared';
import { api } from '../../lib/api';

export const useBaristaDisponible = () =>
  useQuery({
    queryKey: ['barista-estado'],
    queryFn: () => api<{ disponible: boolean }>('/barista/estado'),
    staleTime: 10 * 60_000,
    retry: false,
  });

export const useConversarBarista = () =>
  useMutation({
    mutationFn: (datos: { mensaje: string; historial: MensajeBaristaDto[] }) =>
      api<BaristaRespuestaDto>('/barista', { method: 'POST', body: JSON.stringify(datos) }),
  });