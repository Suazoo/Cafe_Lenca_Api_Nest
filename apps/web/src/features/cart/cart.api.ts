import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CalculoFacturaDto,
  CrearPedidoRespuestaDto,
  DescuentoClienteDto,
  MetodoPagoDto,
} from '@cafe-lenca/shared';
import { api } from '../../lib/api';
import type { ItemCarrito } from './cart.store';

// La API solo necesita id y cantidad: los precios los lee ella de la BD
const aItems = (items: readonly ItemCarrito[]) =>
  items.map((i) => ({ productoId: i.productoId, cantidad: i.cantidad }));

// Nivel y descuento: lo decide el motor Prolog en la API
export const useDescuento = (correo: string | null, activo: boolean) =>
  useQuery({
    queryKey: ['descuento', correo],
    queryFn: () =>
      api<DescuentoClienteDto>(`/recomendaciones/descuento?correo=${encodeURIComponent(correo ?? '')}`),
    enabled: activo && !!correo,
    retry: false,
  });

// Vista previa de la factura (el cálculo imperativo de la API, sin guardar nada)
export const useCalculo = (items: readonly ItemCarrito[], descuentoPorcentaje: number, activo: boolean) =>
  useQuery({
    queryKey: ['calculo', aItems(items), descuentoPorcentaje],
    queryFn: () =>
      api<CalculoFacturaDto>('/pedidos/calcular', {
        method: 'POST',
        body: JSON.stringify({ items: aItems(items), descuentoPorcentaje }),
      }),
    enabled: activo && items.length > 0,
    placeholderData: keepPreviousData,
    retry: false,
  });

export const useMetodosPago = (activo: boolean) =>
  useQuery({
    queryKey: ['metodos-pago'],
    queryFn: () => api<MetodoPagoDto[]>('/pedidos/metodos-pago'),
    enabled: activo,
    staleTime: 5 * 60_000,
  });

export const useCrearPedido = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (datos: { correo: string; items: readonly ItemCarrito[]; metodoPagoId: number }) =>
      api<CrearPedidoRespuestaDto>('/pedidos', {
        method: 'POST',
        body: JSON.stringify({
          correo: datos.correo,
          items: aItems(datos.items),
          metodoPagoId: datos.metodoPagoId,
        }),
      }),
    // El pedido cambia el historial, el nivel y las sugerencias del cliente
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['descuento'] });
      void qc.invalidateQueries({ queryKey: ['historial'] });
      void qc.invalidateQueries({ queryKey: ['estadisticas'] });
      void qc.invalidateQueries({ queryKey: ['recomendaciones'] });
      void qc.invalidateQueries({ queryKey: ['mas-vendidos'] });
    },
  });
};