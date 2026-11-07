import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ItemCarrito {
  productoId: number;
  nombre: string;
  precio: number; // solo para mostrar: el servidor recalcula con los precios de la BD
  cantidad: number;
}

interface EstadoCarrito {
  items: ItemCarrito[];
  agregar: (producto: { productoId: number; nombre: string; precio: number }) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  quitar: (productoId: number) => void;
  vaciar: () => void;
}

const MAX_POR_PRODUCTO = 50; // mismo límite que valida la API

export const useCarrito = create<EstadoCarrito>()(
  persist(
    (set) => ({
      items: [],
      agregar: (p) =>
        set((s) => {
          const existe = s.items.some((i) => i.productoId === p.productoId);
          return {
            items: existe
              ? s.items.map((i) =>
                  i.productoId === p.productoId
                    ? { ...i, cantidad: Math.min(i.cantidad + 1, MAX_POR_PRODUCTO) }
                    : i,
                )
              : [...s.items, { ...p, cantidad: 1 }],
          };
        }),
      cambiarCantidad: (productoId, cantidad) =>
        set((s) => ({
          items:
            cantidad <= 0
              ? s.items.filter((i) => i.productoId !== productoId)
              : s.items.map((i) =>
                  i.productoId === productoId
                    ? { ...i, cantidad: Math.min(cantidad, MAX_POR_PRODUCTO) }
                    : i,
                ),
        })),
      quitar: (productoId) =>
        set((s) => ({ items: s.items.filter((i) => i.productoId !== productoId) })),
      vaciar: () => set({ items: [] }),
    }),
    { name: 'carrito' },
  ),
);

export const totalUnidades = (items: readonly ItemCarrito[]): number =>
  items.reduce((n, i) => n + i.cantidad, 0);