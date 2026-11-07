/**
 * DEMOSTRACIÓN – Rendimiento.
 * Mide el tiempo del código real de cada paradigma. Cada medición descarta una
 * primera ejecución de calentamiento y toma la mediana de varias repeticiones.
 */
import { performance } from 'node:perf_hooks';
import type { MedicionDto, RendimientoDto } from '@cafe-lenca/shared';
import { ESTADO_ACTIVO } from '../common/constants/estado';
import { ClienteDomain } from '../modules/personas/domain/cliente.domain';
import { calcularFactura } from '../modules/facturas/billing.calculator';
import type { LineaEntrada } from '../modules/facturas/billing.calculator';
import { construirHechos } from '../modules/logic/hechos.builder';
import { BASE_CONOCIMIENTO } from '../modules/logic/knowledge-base';
import type { LogicEngineService } from '../modules/logic/logic-engine.service';
import { Categoria } from '../modules/menu/categoria.entity';
import { construirMenu } from '../modules/menu/menu.functions';
import { Producto } from '../modules/menu/producto.entity';
import { sumar } from '../modules/pedidos/pedidos.stats';
import type { ReportesService } from '../modules/reportes/reportes.service';
import { datosDeEjemplo } from './logico.demo';

const REPETICIONES = 5;
const N_SUMA = 200_000;

const redondear = (n: number, decimales = 3): number => {
  const f = 10 ** decimales;
  return Math.round(n * f) / f;
};

const mediana = (valores: number[]): number => {
  const ordenados = [...valores].sort((a, b) => a - b);
  return ordenados[Math.floor(ordenados.length / 2)];
};

const construir = (
  paradigma: string,
  etiqueta: string,
  operaciones: number,
  ms: number,
  nota: string | null,
): MedicionDto => ({
  paradigma,
  etiqueta,
  operaciones,
  ms: redondear(ms),
  msPorOperacion: redondear(ms / operaciones, 6),
  nota,
});

const medir = (
  paradigma: string,
  etiqueta: string,
  operaciones: number,
  tarea: () => unknown,
  nota: string | null = null,
): MedicionDto => {
  tarea(); // calentamiento
  const tiempos: number[] = [];
  for (let i = 0; i < REPETICIONES; i++) {
    const inicio = performance.now();
    tarea();
    tiempos.push(performance.now() - inicio);
  }
  return construir(paradigma, etiqueta, operaciones, mediana(tiempos), nota);
};

const medirAsync = async (
  paradigma: string,
  etiqueta: string,
  operaciones: number,
  tarea: () => Promise<unknown>,
  nota: string | null = null,
): Promise<MedicionDto> => {
  await tarea(); // calentamiento
  const tiempos: number[] = [];
  for (let i = 0; i < REPETICIONES; i++) {
    const inicio = performance.now();
    await tarea();
    tiempos.push(performance.now() - inicio);
  }
  return construir(paradigma, etiqueta, operaciones, mediana(tiempos), nota);
};

// Versión imperativa de la suma, para compararla con reduce y con la recursiva
const sumaImperativa = (datos: readonly number[]): number => {
  let suma = 0;
  for (const n of datos) suma += n;
  return suma;
};

export const demoRendimiento = async (
  motor: LogicEngineService,
  reportes: ReportesService,
): Promise<RendimientoDto> => {
  const numeros = Array.from({ length: N_SUMA }, (_, i) => i % 100);

  const lineas: LineaEntrada[] = Array.from({ length: 2_000 }, (_, i) => ({
    productoId: i,
    nombre: `Producto ${i}`,
    precioUnitario: 20 + (i % 80),
    cantidad: 1 + (i % 4),
  }));

  const categorias = Array.from({ length: 5 }, (_, i) =>
    Object.assign(new Categoria(), {
      idCategoria: i + 1,
      nombre: `Categoría ${i + 1}`,
      descripcion: null,
      estado: ESTADO_ACTIVO,
    }),
  );
  const productos = Array.from({ length: 2_000 }, (_, i) =>
    Object.assign(new Producto(), {
      idProducto: i + 1,
      nombre: `Producto ${i + 1}`,
      descripcion: null,
      precio: 20 + (i % 80),
      estado: ESTADO_ACTIVO,
      categoria: categorias[i % 5],
    }),
  );

  const mediciones: MedicionDto[] = [
    medir('Imperativo', 'Suma de 200.000 números con ciclo for', N_SUMA, () => sumaImperativa(numeros)),
    medir('Funcional', 'Suma de 200.000 números con reduce', N_SUMA, () =>
      numeros.reduce((a, b) => a + b, 0),
    ),
    medir(
      'Funcional',
      'Suma de 200.000 números con recursividad',
      N_SUMA,
      () => sumar(numeros),
      'Función real del proyecto: parte la lista a la mitad y copia sub-listas',
    ),
    medir('Imperativo', 'calcularFactura() con 2.000 líneas', 2_000, () => calcularFactura(lineas, 10)),
    medir(
      'Funcional',
      'construirMenu() con 2.000 productos',
      2_000,
      () => construirMenu(productos),
      'Filtros, orden, map y reduce encadenados sin mutar la entrada',
    ),
    medir('POO', 'Crear 20.000 objetos ClienteDomain', 20_000, () => {
      for (let i = 0; i < 20_000; i++) {
        ClienteDomain.nuevo({ pNombre: 'Ana', pApellido: 'López', correo: `ana${i}@cafelenca.hn` });
      }
    }),
  ];

  const programa = `${BASE_CONOCIMIENTO}\n${construirHechos(
    datosDeEjemplo({ pedidosMes: 6, pedidosTotal: 20, gasto: 2500 }),
  )}`;

  mediciones.push(
    await medirAsync(
      'Lógico',
      'Consulta Prolog: nivel y descuento de un cliente',
      1,
      () => motor.consultar(programa, 'nivel(1, N), porcentaje(N, D)', ['N', 'D'], 1),
      'Incluye crear la sesión y cargar las reglas en cada consulta',
    ),
    await medirAsync(
      'Declarativo',
      'Consulta SQL: productos más vendidos',
      1,
      () => reportes.masVendidos(5),
      'Incluye la latencia de red hacia Supabase',
    ),
  );

  return { node: process.version, fecha: new Date().toISOString(), mediciones };
};