/**
 * DEMOSTRACIÓN – Paradigma declarativo.
 * Sin lógica propia: muestra el SQL real de los reportes y lo ejecuta.
 */
import type { DemoBloque, DemoParadigmaDto } from '@cafe-lenca/shared';
import { ESTADO_ACTIVO } from '../common/constants/estado';
import {
  SQL_MAS_VENDIDOS,
  SQL_RESUMEN_CATEGORIAS,
  SQL_VENTAS_POR_CATEGORIA,
} from '../modules/reportes/reportes.queries';
import type { ReportesService } from '../modules/reportes/reportes.service';
import { json } from './demo.utils';

const sql = (titulo: string, consulta: string): DemoBloque => ({
  titulo,
  lenguaje: 'sql',
  contenido: consulta.trim(),
});

const resultado = (titulo: string, datos: unknown): DemoBloque => ({
  titulo,
  lenguaje: 'json',
  contenido: json(datos),
});

export const demoDeclarativo = async (reportes: ReportesService): Promise<DemoParadigmaDto> => {
  const [masVendidos, ventas, resumen] = await Promise.all([
    reportes.masVendidos(5),
    reportes.ventasPorCategoria(),
    reportes.resumenCategorias(),
  ]);

  return {
    id: 'declarativo',
    nombre: 'Paradigma declarativo (SQL)',
    cumple: [
      'Se describe QUÉ se quiere obtener, no cómo calcularlo',
      'SELECT con JOIN entre varias tablas',
      'WHERE para filtrar, GROUP BY para agrupar y ORDER BY para ordenar',
      'Funciones de agregado: SUM, AVG, MAX y COUNT',
    ],
    usadoEn: ['reportes/reportes.queries.ts → GET /reportes/* y la sección "Los más pedidos" del Inicio'],
    bloques: [
      sql('Productos más vendidos ($1 = 5)', SQL_MAS_VENDIDOS),
      resultado('Resultado', masVendidos),
      sql('Ventas por categoría', SQL_VENTAS_POR_CATEGORIA),
      resultado('Resultado', ventas),
      sql(`Resumen del menú por categoría ($1 = '${ESTADO_ACTIVO}')`, SQL_RESUMEN_CATEGORIAS),
      resultado('Resultado', resumen),
    ],
  };
};