/**
 * PARADIGMA: Funcional
 * Cumple: funciones puras (sin efectos ni estado externo), inmutabilidad
 *         (nunca se modifica el arreglo recibido), lambdas, filter, map,
 *         reduce y composición de funciones.
 * Usado en: GET /menu
 */
import type { MenuCategoriaDto, MenuItemDto,ImagenProductoDto } from '@cafe-lenca/shared';
import { ESTADO_ACTIVO } from '../../common/constants/estado';
import type { Producto } from './producto.entity';

export interface FiltrosMenu {
  categoriaId?: number;
  precioMax?: number;
  orden?: 'asc' | 'desc';
}

// filter con lambda: solo productos activos
export const filtrarDisponibles = (productos: readonly Producto[]): Producto[] =>
  productos.filter((p) => p.estado === ESTADO_ACTIVO);

export const filtrarPorCategoria = (
  productos: readonly Producto[],
  categoriaId: number,
): Producto[] => productos.filter((p) => p.categoria?.idCategoria === categoriaId);

export const filtrarPorPrecioMax = (
  productos: readonly Producto[],
  precioMax: number,
): Producto[] => productos.filter((p) => p.precio <= precioMax);

// Se copia el arreglo con spread para no mutar el original (inmutabilidad)
export const ordenarPorPrecio = (
  productos: readonly Producto[],
  orden: 'asc' | 'desc' = 'asc',
): Producto[] =>
  [...productos].sort((a, b) => (orden === 'asc' ? a.precio - b.precio : b.precio - a.precio));

// map: transforma la entidad en el DTO que consume el cliente
export const aMenuItem = (p: Producto): MenuItemDto => ({
  id: p.idProducto,
  nombre: p.nombre,
  descripcion: p.descripcion,
  precio: p.precio,
  categoriaId: p.categoria?.idCategoria ?? null,
  categoria: p.categoria?.nombre ?? null,
  imagen: null,
});

// reduce: agrupa por categoría sin mutar el acumulador
export const agruparPorCategoria = (items: readonly MenuItemDto[]): MenuCategoriaDto[] =>
  items.reduce<MenuCategoriaDto[]>((grupos, item) => {
    const existe = grupos.some((g) => g.categoriaId === item.categoriaId);
    return existe
      ? grupos.map((g) =>
          g.categoriaId === item.categoriaId ? { ...g, items: [...g.items, item] } : g,
        )
      : [
          ...grupos,
          { categoriaId: item.categoriaId, categoria: item.categoria ?? 'Otros', items: [item] },
        ];
  }, []);

// Composición: disponibles → categoría → precio → orden → map → reduce
export const construirMenu = (
  productos: readonly Producto[],
  filtros: FiltrosMenu = {},
): MenuCategoriaDto[] => {
  const disponibles = filtrarDisponibles(productos);
  const porCategoria =
    filtros.categoriaId === undefined
      ? disponibles
      : filtrarPorCategoria(disponibles, filtros.categoriaId);
  const porPrecio =
    filtros.precioMax === undefined ? porCategoria : filtrarPorPrecioMax(porCategoria, filtros.precioMax);

  return agruparPorCategoria(ordenarPorPrecio(porPrecio, filtros.orden).map(aMenuItem));
};

// map: agrega la foto de cada producto sin modificar el menú original
export const conImagenes = (
  menu: readonly MenuCategoriaDto[],
  imagenes: ReadonlyMap<number, ImagenProductoDto>,
): MenuCategoriaDto[] =>
  menu.map((g) => ({
    ...g,
    items: g.items.map((i) => ({ ...i, imagen: imagenes.get(i.id) ?? null })),
  }));