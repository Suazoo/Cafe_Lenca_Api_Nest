/**
 * PARADIGMA: Lógico
 * Cumple: motor de inferencia (tau-prolog) integrado en la API. Carga un
 *         programa Prolog, ejecuta un objetivo y recorre todas las
 *         soluciones por backtracking.
 * Usado en: LogicService
 */
import { Injectable } from '@nestjs/common';
import * as pl from 'tau-prolog';

export type ValorProlog = string | number;
export type Solucion = Record<string, ValorProlog>;

const LIMITE_INFERENCIAS = 200_000;

type Resolver<T> = (valor: T) => void;
type Rechazar = (error: Error) => void;

const aError = (e: unknown): Error => new Error(`Error del motor Prolog: ${String(e)}`);

@Injectable()
export class LogicEngineService {
  /**
   * @param programa  reglas + hechos en texto Prolog
   * @param objetivo  consulta, por ejemplo: nivel(12, N), porcentaje(N, D)
   * @param variables nombres de las variables del objetivo que se quieren leer
   */
  async consultar(
    programa: string,
    objetivo: string,
    variables: string[],
    limite = 100,
  ): Promise<Solucion[]> {
    // Una sesión nueva por consulta: los hechos de un cliente nunca se mezclan con otros
    const sesion = pl.create(LIMITE_INFERENCIAS);

    await new Promise<void>((ok: Resolver<void>, fallo: Rechazar) =>
      sesion.consult(programa, { success: () => ok(), error: (e: unknown) => fallo(aError(e)) }),
    );

    const meta = objetivo.trim().endsWith('.') ? objetivo.trim() : `${objetivo.trim()}.`;
    await new Promise<void>((ok: Resolver<void>, fallo: Rechazar) =>
      sesion.query(meta, { success: () => ok(), error: (e: unknown) => fallo(aError(e)) }),
    );

    const soluciones: Solucion[] = [];
    while (soluciones.length < limite) {
      const respuesta = await new Promise<unknown>((ok: Resolver<unknown>, fallo: Rechazar) =>
        sesion.answer({
          success: (r: unknown) => ok(r),
          fail: () => ok(null),
          limit: () => ok(null),
          error: (e: unknown) => fallo(aError(e)),
        }),
      );
      if (respuesta === null) {
        break; // no hay más soluciones
      }
      soluciones.push(this.extraer(respuesta, variables));
    }
    return soluciones;
  }

  private extraer(respuesta: unknown, variables: string[]): Solucion {
    const sustitucion = respuesta as { lookup: (nombre: string) => unknown };
    const fila: Solucion = {};
    for (const nombre of variables) {
      const termino = sustitucion.lookup(nombre);
      if (termino !== null && termino !== undefined) {
        fila[nombre] = this.aValor(termino);
      }
    }
    return fila;
  }

  private aValor(termino: unknown): ValorProlog {
    if (pl.type.is_number(termino)) {
      return (termino as { value: number }).value;
    }
    if (pl.type.is_atom(termino)) {
      return (termino as { id: string }).id;
    }
    return String(termino);
  }
}