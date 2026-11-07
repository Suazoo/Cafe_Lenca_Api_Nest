/**
 * PARADIGMA: Imperativo
 * Cumple: variables mutables (let), secuencia de instrucciones, ciclo for...of
 *         y condicionales if. El algoritmo se ejecuta paso a paso, cambiando
 *         el estado de los acumuladores.
 * Usado en: POST /pedidos/calcular (y después, al generar la factura de un pedido)
 */
import type { CalculoFacturaDto, LineaFacturaDto } from '@cafe-lenca/shared';
import { TASA_ISV } from '../../common/constants/impuestos';

export interface LineaEntrada {
  productoId: number;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
}

const redondear = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

export function calcularFactura(
  lineas: LineaEntrada[],
  descuentoPorcentaje = 0,
): CalculoFacturaDto {
  // Paso 1: variables acumuladoras
  let subtotal = 0;
  let unidades = 0;
  const detalle: LineaFacturaDto[] = [];

  // Paso 2: ciclo que recorre cada línea del pedido
  for (const linea of lineas) {
    if (linea.cantidad <= 0) {
      continue; // condicional: se ignoran cantidades inválidas
    }
    const importe = redondear(linea.precioUnitario * linea.cantidad);
    subtotal += importe;
    unidades += linea.cantidad;
    detalle.push({ ...linea, importe });
  }
  subtotal = redondear(subtotal);

  // Paso 3: descuento (solo si aplica)
  let descuento = 0;
  if (descuentoPorcentaje > 0) {
    descuento = redondear((subtotal * descuentoPorcentaje) / 100);
  }

  // Paso 4: impuesto sobre la base ya descontada
  const base = subtotal - descuento;
  const impuesto = redondear(base * TASA_ISV);

  // Paso 5: total
  const total = redondear(base + impuesto);

  return { lineas: detalle, unidades, subtotal, descuento, impuesto, total };
}