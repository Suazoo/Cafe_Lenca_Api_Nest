/**
 * PARADIGMA: Orientado a Objetos
 * Cumple: herencia (extends PersonaDomain) y polimorfismo (su propio describir()).
 * Usado en: demo de paradigmas (la vista del cliente no muestra empleados).
 */
import { PersonaDomain, ReglaDominioError } from './persona.domain';
import type { DatosPersona } from './persona.domain';
import type { Empleado } from '../../empleados/empleado.entity';

export class EmpleadoDomain extends PersonaDomain {
  private readonly _idEmpleado: number;
  private readonly _roles: string[];

  private constructor(datos: DatosPersona, idEmpleado: number, roles: string[]) {
    super(datos);
    this._idEmpleado = idEmpleado;
    this._roles = roles;
  }

  // Requiere cargar las relaciones: persona y roles.rol
  static desdeEntidad(entidad: Empleado): EmpleadoDomain {
    const persona = entidad.persona;
    if (!persona) {
      throw new ReglaDominioError('El empleado no tiene datos de persona asociados');
    }
    return new EmpleadoDomain(
      {
        id: persona.idPersona,
        pNombre: persona.pNombre,
        sNombre: persona.sNombre,
        pApellido: persona.pApellido,
        sApellido: persona.sApellido,
        correo: persona.correo,
        fechaRegistro: persona.fechaRegistro,
      },
      entidad.idEmpleado,
      (entidad.roles ?? []).map((r) => r.rol.nombre),
    );
  }

  get tipo(): 'EMPLEADO' {
    return 'EMPLEADO';
  }

  get idEmpleado(): number { return this._idEmpleado; }
  get roles(): readonly string[] { return this._roles; }

  tieneRol(nombre: string): boolean {
    return this._roles.some((r) => r.toLowerCase() === nombre.toLowerCase());
  }

  describir(): string {
    return `Empleado ${this.nombreCompleto} (roles: ${this._roles.join(', ') || 'sin rol'})`;
  }
}