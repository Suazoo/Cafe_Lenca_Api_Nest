/**
 * DEMOSTRACIÓN – Programación orientada a objetos.
 * Sin lógica propia: usa las clases de dominio reales (PersonaDomain,
 * ClienteDomain y EmpleadoDomain).
 */
import type { DemoParadigmaDto } from '@cafe-lenca/shared';
import { ClienteDomain } from '../modules/personas/domain/cliente.domain';
import { EmpleadoDomain } from '../modules/personas/domain/empleado.domain';
import { Empleado } from '../modules/empleados/empleado.entity';
import { RolHasEmpleado } from '../modules/empleados/rol-has-empleado.entity';
import { Rol } from '../modules/empleados/rol.entity';
import { ReglaDominioError } from '../modules/personas/domain/persona.domain';
import type { PersonaDomain } from '../modules/personas/domain/persona.domain';
import { Persona } from '../modules/personas/persona.entity';
import { json } from './demo.utils';

// Empleado armado en memoria: la vista del cliente no consulta empleados
const empleadoDeEjemplo = (): Empleado => {
  const persona = Object.assign(new Persona(), {
    idPersona: 900,
    pNombre: 'Carlos',
    sNombre: null,
    pApellido: 'Mejía',
    sApellido: null,
    correo: 'carlos@cafelenca.hn',
    fechaRegistro: new Date('2026-01-15'),
  });
  const rol = Object.assign(new Rol(), { idRol: 1, nombre: 'Barista', estado: '1' });
  const relacion = Object.assign(new RolHasEmpleado(), { rolId: 1, empleadoId: 500, rol });
  return Object.assign(new Empleado(), { idEmpleado: 500, persona, roles: [relacion] });
};

const probar = (intento: string, accion: () => unknown) => {
  try {
    accion();
    return { intento, resultado: 'Aceptado' };
  } catch (e) {
    return {
      intento,
      resultado: e instanceof ReglaDominioError ? `Rechazado: ${e.message}` : 'Error inesperado',
    };
  }
};

export const demoOop = (): DemoParadigmaDto => {
  const cliente = ClienteDomain.nuevo({
    pNombre: 'María',
    pApellido: 'Suazo',
    correo: 'maria@cafelenca.hn',
    telefono: '+504 9999-0000',
  });
  cliente.agregarPreferencia('bebida_favorita', 'Café con leche');
  const empleado = EmpleadoDomain.desdeEntidad(empleadoDeEjemplo());

  // Polimorfismo: la misma llamada produce un resultado distinto según la subclase
  const personas: PersonaDomain[] = [cliente, empleado];
  const polimorfismo = personas.map((p) => ({
    clase: p.constructor.name,
    tipo: p.tipo,
    nombreCompleto: p.nombreCompleto,
    describir: p.describir(),
  }));

  // Encapsulamiento: las reglas se aplican dentro de la clase, no fuera
  const reglas = [
    probar('cliente.cambiarCorreo("correo-invalido")', () => cliente.cambiarCorreo('correo-invalido')),
    probar('cliente.cambiarCorreo("maria.nueva@cafelenca.hn")', () =>
      cliente.cambiarCorreo('maria.nueva@cafelenca.hn'),
    ),
    probar('agregarPreferencia("bebida_favorita", "Café con leche") otra vez', () =>
      cliente.agregarPreferencia('bebida_favorita', 'Café con leche'),
    ),
    probar('agregarPreferencia("", "")', () => cliente.agregarPreferencia('', '')),
  ];

  return {
    id: 'oop',
    nombre: 'Programación orientada a objetos',
    cumple: [
      'Clases y objetos: PersonaDomain, ClienteDomain, EmpleadoDomain',
      'Herencia: Cliente y Empleado extienden de Persona',
      'Encapsulamiento: campos privados, getters y reglas dentro de los métodos',
      'Constructores: protegido en la clase base y privado con fábricas estáticas en las hijas',
      'Métodos y polimorfismo: describir() cambia según la subclase',
    ],
    usadoEn: [
      'personas/domain/persona.domain.ts',
      'clientes/domain/cliente.domain.ts → POST /clientes y GET /clientes/perfil',
      'empleados/domain/empleado.domain.ts',
    ],
    bloques: [
      {
        titulo: 'Jerarquía de clases',
        lenguaje: 'texto',
        contenido: ['PersonaDomain (abstracta)', ' ├─ ClienteDomain', ' └─ EmpleadoDomain'].join('\n'),
      },
      { titulo: 'Polimorfismo', lenguaje: 'json', contenido: json(polimorfismo) },
      { titulo: 'Encapsulamiento: reglas que se aplican solas', lenguaje: 'json', contenido: json(reglas) },
    ],
  };
};