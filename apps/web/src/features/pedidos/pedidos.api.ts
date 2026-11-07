import { useQuery } from '@tanstack/react-query';
import type { EstadisticasClienteDto, PedidoHistorialDto } from '@cafe-lenca/shared';
import { api } from '../../lib/api';

export const useHistorial = (correo: string | null) =>
  useQuery({
    queryKey: ['historial', correo],
    queryFn: () => api<PedidoHistorialDto[]>(`/pedidos?correo=${encodeURIComponent(correo ?? '')}`),
    enabled: !!correo,
    retry: false,
  });

export const useEstadisticas = (correo: string | null) =>
  useQuery({
    queryKey: ['estadisticas', correo],
    queryFn: () => api<EstadisticasClienteDto>(`/pedidos/estadisticas?correo=${encodeURIComponent(correo ?? '')}`),
    enabled: !!correo,
    retry: false,
  });