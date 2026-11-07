import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import type { DemoParadigmaDto, RendimientoDto } from '@cafe-lenca/shared';
import { api } from '../../lib/api';

export type IdDemo = 'imperativo' | 'oop' | 'funcional' | 'declarativo';

export interface Escenario {
  pedidosMes: number;
  pedidosTotal: number;
  gasto: number;
}

export const useDemo = (id: IdDemo) =>
  useQuery({
    queryKey: ['demo', id],
    queryFn: () => api<DemoParadigmaDto>(`/paradigms/${id}`),
    staleTime: 5 * 60_000,
  });

export const useLogico = (e: Escenario) =>
  useQuery({
    queryKey: ['demo', 'logico', e],
    queryFn: () =>
      api<DemoParadigmaDto>(
        `/paradigms/logico?pedidosMes=${e.pedidosMes}&pedidosTotal=${e.pedidosTotal}&gasto=${e.gasto}`,
      ),
    placeholderData: keepPreviousData,
  });

// La medición solo corre cuando se pulsa el botón
export const useRendimiento = () =>
  useMutation({ mutationFn: () => api<RendimientoDto>('/paradigms/rendimiento') });