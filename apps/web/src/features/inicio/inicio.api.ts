import { useQuery } from '@tanstack/react-query';
import type { ProductoMasVendidoDto, RecomendacionDto } from '@cafe-lenca/shared';
import { api } from '../../lib/api';

export const useRecomendaciones = (correo: string | null) =>
  useQuery({
    queryKey: ['recomendaciones', correo],
    queryFn: () => api<RecomendacionDto[]>(`/recomendaciones?correo=${encodeURIComponent(correo ?? '')}`),
    enabled: !!correo,
    retry: false,
  });

export const useMasVendidos = (limite = 5) =>
  useQuery({
    queryKey: ['mas-vendidos', limite],
    queryFn: () => api<ProductoMasVendidoDto[]>(`/reportes/mas-vendidos?limite=${limite}`),
  });