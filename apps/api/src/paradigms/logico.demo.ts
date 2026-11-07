/**
 * DEMOSTRACIÓN – Paradigma lógico.
 * Sin lógica propia: carga la base de conocimiento real (Prolog) con los
 * hechos de un cliente de ejemplo y consulta al motor de inferencia.
 */
import type { DemoParadigmaDto } from '@cafe-lenca/shared';
import { construirHechos } from '../modules/logic/hechos.builder';
import type { DatosCliente } from '../modules/logic/hechos.builder';
import { BASE_CONOCIMIENTO } from '../modules/logic/knowledge-base';
import type { LogicEngineService } from '../modules/logic/logic-engine.service';
import { json } from './demo.utils';

export interface EscenarioLogico {
  pedidosMes: number;
  pedidosTotal: number;
  gasto: number;
}

export const datosDeEjemplo = (e: EscenarioLogico): DatosCliente => ({
  idCliente: 1,
  pedidosMes: e.pedidosMes,
  pedidosTotal: e.pedidosTotal,
  gastoTotal: e.gasto,
  compras: [2],
  preferencias: [{ tipo: 'bebida_favorita', valor: 'Café con leche' }],
  productos: [
    { id: 1, nombre: 'Café con leche', categoria: 'Bebidas', precio: 45 },
    { id: 2, nombre: 'Capuchino', categoria: 'Bebidas', precio: 50 },
    { id: 3, nombre: 'Té frío', categoria: 'Bebidas', precio: 40 },
    { id: 4, nombre: 'Pan de plátano', categoria: 'Panadería', precio: 30 },
  ],
  populares: [4],
});

export const demoLogico = async (
  motor: LogicEngineService,
  escenario: EscenarioLogico,
): Promise<DemoParadigmaDto> => {
  const datos = datosDeEjemplo(escenario);
  const hechos = construirHechos(datos);
  const programa = `${BASE_CONOCIMIENTO}\n${hechos}`;

  // Cada regla se consulta por separado para ver cuáles se cumplen
  const reglas = await Promise.all(
    ['cliente_vip(1)', 'cliente_frecuente(1)', 'cliente_nuevo(1)'].map(async (objetivo) => ({
      consulta: objetivo,
      seCumple: (await motor.consultar(programa, objetivo, [], 1)).length > 0,
    })),
  );

  const [nivel] = await motor.consultar(programa, 'nivel(1, N), porcentaje(N, D)', ['N', 'D'], 1);
  const recomendaciones = await motor.consultar(programa, 'recomendar(1, P, R)', ['P', 'R'], 20);

  return {
    id: 'logico',
    nombre: 'Paradigma lógico (Prolog)',
    cumple: [
      'Base de conocimiento: hechos y reglas escritos en Prolog',
      'Inferencia: el motor deduce el nivel del cliente a partir de los hechos',
      'Reglas lógicas: cliente_vip, cliente_frecuente, cliente_nuevo, nivel y recomendar',
      'Backtracking: recomendar/3 devuelve varias soluciones por reglas distintas',
    ],
    usadoEn: [
      'logic/knowledge-base.ts → POST /pedidos (descuento)',
      'logic/logic.service.ts → GET /recomendaciones y GET /recomendaciones/descuento',
    ],
    bloques: [
      { titulo: 'Base de conocimiento (reglas y umbrales)', lenguaje: 'prolog', contenido: BASE_CONOCIMIENTO.trim() },
      { titulo: 'Hechos del escenario (generados desde los datos)', lenguaje: 'prolog', contenido: hechos },
      {
        titulo: 'Reglas que se cumplen',
        lenguaje: 'json',
        contenido: json({ escenario, reglas }),
      },
      {
        titulo: 'Inferencia: nivel(1, N), porcentaje(N, D)',
        lenguaje: 'json',
        contenido: json({ nivel: nivel?.N ?? null, descuentoPorcentaje: nivel?.D ?? null }),
      },
      {
        titulo: 'Inferencia: recomendar(1, P, Regla) — una fila por solución',
        lenguaje: 'json',
        contenido: json(
          recomendaciones.map((r) => ({
            producto: datos.productos.find((p) => p.id === Number(r.P))?.nombre ?? r.P,
            regla: String(r.R),
          })),
        ),
      },
    ],
  };
};