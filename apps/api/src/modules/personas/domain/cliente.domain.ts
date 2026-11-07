/**
 * PARADIGMA: Orientado a Objetos
 * Cumple: herencia (extends PersonaDomain), constructor privado con fábricas
 *         estáticas, encapsulamiento de teléfonos/preferencias (solo lectura
 *         desde fuera) y métodos con reglas (agregarPreferencia).
 * Usado en: POST /clientes, GET /clientes/perfil, POST /clientes/:id/preferencias
 */
import type { PerfilClienteDto } from '@cafe-lenca/shared';
import { PersonaDomain, ReglaDominioError } from './persona.domain';
import type { DatosPersona } from './persona.domain';
import type { Cliente } from '../../clientes/cliente.entity';

export interface PreferenciaDomain {
  id: number | null;
  tipo: string;
  valor: string;
}

export interface DatosNuevoCliente {
  pNombre: string;
  sNombre?: string | null;
  pApellido: string;
  sApellido?: string | null;
  correo: string;
  telefono?: string | null;
}

export class ClienteDomain extends PersonaDomain {
  private readonly _idCliente: number | null;
  private readonly _telefonos: string[];
  private readonly _preferencias: PreferenciaDomain[];

  private constructor(
    datos: DatosPersona,
    idCliente: number | null,
    telefonos: string[],
    preferencias: PreferenciaDomain[],
  ) {
    super(datos);
    this._idCliente = idCliente;
    this._telefonos = telefonos;
    this._preferencias = preferencias;
  }

  // Fábrica 1: cliente nuevo (aún sin id)
  static nuevo(datos: DatosNuevoCliente): ClienteDomain {
    const telefono = datos.telefono?.trim();
    return new ClienteDomain(
      {
        id: null,
        pNombre: datos.pNombre,
        sNombre: datos.sNombre ?? null,
        pApellido: datos.pApellido,
        sApellido: datos.sApellido ?? null,
        correo: datos.correo,
        fechaRegistro: null,
      },
      null,
      telefono ? [telefono] : [],
      [],
    );
  }

  // Fábrica 2: reconstruye el objeto de dominio desde la entidad de la BD
  static desdeEntidad(entidad: Cliente): ClienteDomain {
    const persona = entidad.persona;
    if (!persona) {
      throw new ReglaDominioError('El cliente no tiene datos de persona asociados');
    }
    return new ClienteDomain(
      {
        id: persona.idPersona,
        pNombre: persona.pNombre,
        sNombre: persona.sNombre,
        pApellido: persona.pApellido,
        sApellido: persona.sApellido,
        correo: persona.correo,
        fechaRegistro: persona.fechaRegistro,
      },
      entidad.idCliente,
      (persona.telefonos ?? []).map((t) => t.numero),
      (entidad.preferencias ?? []).map((p) => ({
        id: p.idPreferencia,
        tipo: p.tipoPreferencia,
        valor: p.valor,
      })),
    );
  }

  get tipo(): 'CLIENTE' {
    return 'CLIENTE';
  }

  get idCliente(): number | null { return this._idCliente; }
  get telefonos(): readonly string[] { return this._telefonos; }
  get preferencias(): readonly PreferenciaDomain[] { return this._preferencias; }

  // Regla: no se permiten preferencias vacías ni repetidas
  agregarPreferencia(tipo: string, valor: string): PreferenciaDomain {
    const t = tipo.trim();
    const v = valor.trim();
    if (!t || !v) {
      throw new ReglaDominioError('La preferencia necesita tipo y valor');
    }
    const repetida = this._preferencias.some(
      (p) => p.tipo.toLowerCase() === t.toLowerCase() && p.valor.toLowerCase() === v.toLowerCase(),
    );
    if (repetida) {
      throw new ReglaDominioError('Esa preferencia ya está registrada');
    }
    const nueva: PreferenciaDomain = { id: null, tipo: t, valor: v };
    this._preferencias.push(nueva);
    return nueva;
  }

  describir(): string {
    return `Cliente ${this.nombreCompleto} (${this._preferencias.length} preferencias)`;
  }

  toDto(): PerfilClienteDto {
    if (this._idCliente === null) {
      throw new ReglaDominioError('El cliente aún no ha sido guardado');
    }
    return {
      idCliente: this._idCliente,
      nombreCompleto: this.nombreCompleto,
      correo: this.correo,
      telefonos: [...this._telefonos],
      preferencias: this._preferencias.map((p) => ({ ...p })),
      fechaRegistro: this.fechaRegistro?.toISOString() ?? null,
    };
  }
}