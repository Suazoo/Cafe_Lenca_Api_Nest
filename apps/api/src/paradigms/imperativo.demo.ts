/**
 * DEMOSTRACIÓN – Paradigma imperativo.
 * Sin lógica propia: ejecuta calcularFactura() (código real de facturas).
 */
import type { DemoParadigmaDto } from '@cafe-lenca/shared';
import { TASA_ISV } from '../common/constants/impuestos';
import { calcularFactura } from '../modules/facturas/billing.calculator';
import type { LineaEntrada } from '../modules/facturas/billing.calculator';
import { json } from './demo.utils';

const LINEAS_EJEMPLO: LineaEntrada[] = [
  { productoId: 1, nombre: 'Café con leche', precioUnitario: 45, cantidad: 2 },
  { productoId: 2, nombre: 'Pan de plátano', precioUnitario: 30, cantidad: 1 },
  { productoId: 3, nombre: 'Línea con cantidad inválida', precioUnitario: 99, cantidad: 0 },
];

export const demoImperativo = (): DemoParadigmaDto => {
  const descuentoPorcentaje = 10;
  return {
    id: 'imperativo',
    nombre: 'Paradigma imperativo',
    cumple: [
      'Variables mutables que acumulan el estado (subtotal, unidades)',
      'Secuencia de instrucciones ejecutadas paso a paso',
      'Ciclo for…of que recorre cada línea del pedido',
      'Condicionales: ignorar cantidades inválidas y aplicar el descuento solo si existe',
    ],
    usadoEn: ['facturas/billing.calculator.ts → POST /pedidos/calcular y POST /pedidos'],
    bloques: [
      {
        titulo: 'Entrada: líneas del pedido y porcentaje de descuento',
        lenguaje: 'json',
        contenido: json({ lineas: LINEAS_EJEMPLO, descuentoPorcentaje }),
      },
      {
        titulo: 'Salida de calcularFactura()',
        lenguaje: 'json',
        contenido: json(calcularFactura(LINEAS_EJEMPLO, descuentoPorcentaje)),
      },
      {
        titulo: 'El algoritmo, paso a paso',
        lenguaje: 'texto',
        contenido: [
          '1. subtotal = 0; unidades = 0',
          '2. para cada línea: si cantidad <= 0 se ignora; si no, importe = precio × cantidad y se acumula',
          '3. si descuentoPorcentaje > 0: descuento = subtotal × porcentaje / 100',
          `4. impuesto = (subtotal − descuento) × ${TASA_ISV * 100} %`,
          '5. total = subtotal − descuento + impuesto',
        ].join('\n'),
      },
    ],
  };
};