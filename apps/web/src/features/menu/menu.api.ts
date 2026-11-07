import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ImagenProductoDto, MenuCategoriaDto } from '@cafe-lenca/shared';
import { api } from '../../lib/api';


export interface FiltrosMenu {
  categoriaId?: number;
  maxPrecio?: number;
  orden: 'asc' | 'desc';
}

export const FILTROS_INICIALES: FiltrosMenu = { orden: 'asc' };

const aQuery = (f: FiltrosMenu): string => {
  const p = new URLSearchParams();
  if (f.categoriaId !== undefined) p.set('categoria', String(f.categoriaId));
  if (f.maxPrecio !== undefined) p.set('maxPrecio', String(f.maxPrecio));
  p.set('orden', f.orden);
  return p.toString();
};

// Con keepPreviousData la lista no parpadea mientras llega el nuevo filtro
export const useMenu = (filtros: FiltrosMenu = FILTROS_INICIALES) =>
  useQuery({
    queryKey: ['menu', filtros],
    queryFn: () => api<MenuCategoriaDto[]>(`/menu?${aQuery(filtros)}`),
    placeholderData: keepPreviousData,
  });

  // Busca la foto de un producto en el menú que ya está en caché
export const useImagenProducto = (id: number): ImagenProductoDto | null => {
  const { data } = useMenu(FILTROS_INICIALES);
  return useMemo(
    () => data?.flatMap((g) => g.items).find((i) => i.id === id)?.imagen ?? null,
    [data, id],
  );
};