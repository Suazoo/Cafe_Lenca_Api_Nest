/**
 * PARADIGMA: Orientado a Objetos
 * Cumple: clase abstracta (abstracción), constructor con validación,
 *         encapsulamiento (campos privados + getters), herencia (Cliente y
 *         Empleado la extienden) y polimorfismo (describir()).
 * Usado en: GET /clientes/perfil, POST /clientes
 */
export class ReglaDominioError extends Error {}

export interface DatosPersona {
  id: number | null;
  pNombre: string;
  sNombre: string | null;
  pApellido: string;
  sApellido: string | null;
  correo: string;
  fechaRegistro: Date | null;
}

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export abstract class PersonaDomain {
  private readonly _id: number | null;
  private readonly _pNombre: string;
  private readonly _sNombre: string | null;
  private readonly _pApellido: string;
  private readonly _sApellido: string | null;
  private _correo: string;
  private readonly _fechaRegistro: Date | null;

  // Constructor protegido: solo las subclases pueden crear personas
  protected constructor(datos: DatosPersona) {
    this._id = datos.id;
    this._pNombre = PersonaDomain.textoObligatorio(datos.pNombre, 'El primer nombre');
    this._sNombre = PersonaDomain.textoOpcional(datos.sNombre);
    this._pApellido = PersonaDomain.textoObligatorio(datos.pApellido, 'El primer apellido');
    this._sApellido = PersonaDomain.textoOpcional(datos.sApellido);
    this._correo = PersonaDomain.correoValido(datos.correo);
    this._fechaRegistro = datos.fechaRegistro;
  }

  private static textoObligatorio(valor: string, campo: string): string {
    const limpio = valor.trim();
    if (limpio.length === 0) {
      throw new ReglaDominioError(`${campo} es obligatorio`);
    }
    return limpio;
  }

  private static textoOpcional(valor: string | null): string | null {
    const limpio = valor?.trim();
    return limpio ? limpio : null;
  }

  private static correoValido(valor: string): string {
    const limpio = valor.trim();
    if (!REGEX_CORREO.test(limpio)) {
      throw new ReglaDominioError('El correo no tiene un formato válido');
    }
    return limpio;
  }

  get id(): number | null { return this._id; }
  get pNombre(): string { return this._pNombre; }
  get sNombre(): string | null { return this._sNombre; }
  get pApellido(): string { return this._pApellido; }
  get sApellido(): string | null { return this._sApellido; }
  get correo(): string { return this._correo; }
  get fechaRegistro(): Date | null { return this._fechaRegistro; }

  get nombreCompleto(): string {
    return [this._pNombre, this._sNombre, this._pApellido, this._sApellido]
      .filter((parte): parte is string => !!parte)
      .join(' ');
  }

  // Método con regla de negocio: el único modo de cambiar el correo
  cambiarCorreo(nuevoCorreo: string): void {
    this._correo = PersonaDomain.correoValido(nuevoCorreo);
  }

  // Cada subclase define su propio comportamiento (polimorfismo)
  abstract get tipo(): 'CLIENTE' | 'EMPLEADO';
  abstract describir(): string;
}