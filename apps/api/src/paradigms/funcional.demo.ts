/**
 * DEMOSTRACIÓN – Paradigma funcional.
 * Sin lógica propia: ejecuta las funciones puras reales del menú y de las
 * estadísticas de pedidos.
 */
import type { DemoParadigmaDto } from '@cafe-lenca/shared';
import { construirMenu } from '../modules/menu/menu.functions';
import type { Producto } from '../modules/menu/producto.entity';
import { mejorPor, sumar } from '../modules/pedidos/pedidos.stats';
import { json } from './demo.utils';

const redondear = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

export const demoFuncional = (productos: readonly Producto[]): DemoParadigmaDto => {
  const idsAntes = productos.map((p) => p.idProducto).join(',');

  // Un arreglo congelado: si alguna función intentara modificarlo, lanzaría un error
  const congelados = Object.freeze([...productos]);
  const menu = construirMenu(congelados, { precioMax: 80, orden: 'desc' });
  const idsDespues = congelados.map((p) => p.idProducto).join(',');

  const precios = productos.map((p) => p.precio);
  const palabras = ['café', 'capuchino', 'té', 'chocolate caliente'];

  return {
    id: 'funcional',
    nombre: 'Paradigma funcional',
    cumple: [
      'Funciones puras: mismo resultado para la misma entrada y sin efectos secundarios',
      'Inmutabilidad: nunca se modifican los arreglos recibidos',
      'Funciones lambda, map(), filter() y reduce()',
      'Recursividad: sumar() y mejorPor()',
      'Composición: construirMenu() encadena filtros, orden, map y reduce',
    ],
    usadoEn: [
      'menu/menu.functions.ts → GET /menu',
      'pedidos/pedidos.stats.ts → GET /pedidos y GET /pedidos/estadisticas',
    ],
    bloques: [
      {
        titulo: 'Entrada: productos del menú',
        lenguaje: 'json',
        contenido: json(
          productos.map((p) => ({ id: p.idProducto, nombre: p.nombre, precio: p.precio, estado: p.estado })),
        ),
      },
      {
        titulo: "construirMenu(productos, { precioMax: 80, orden: 'desc' })",
        lenguaje: 'json',
        contenido: json(
          menu.map((g) => ({
            categoria: g.categoria,
            productos: g.items.map((i) => `${i.nombre} (${i.precio})`),
          })),
        ),
      },
      {
        titulo: 'Inmutabilidad: la entrada quedó intacta',
        lenguaje: 'json',
        contenido: json({
          arregloCongelado: Object.isFrozen(congelados),
          ordenAntes: idsAntes,
          ordenDespues: idsDespues,
          sinCambios: idsAntes === idsDespues,
        }),
      },
      {
        titulo: 'Recursividad',
        lenguaje: 'json',
        contenido: json({
          'sumar(precios) — divide y vencerás': redondear(sumar(precios)),
          'precio promedio': precios.length === 0 ? 0 : redondear(sumar(precios) / precios.length),
          'mejorPor(palabras, p => p.length)': mejorPor(palabras, (p) => p.length),
        }),
      },
    ],
  };
};