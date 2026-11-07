import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Empleado } from './empleado.entity';
import { Rol } from './rol.entity';

@Entity('rol_has_empleado')
export class RolHasEmpleado {
  @PrimaryColumn({ name: 'rol_idrol', type: 'int' }) rolId!: number;
  @PrimaryColumn({ name: 'empleado_idempleado', type: 'int' }) empleadoId!: number;

  @ManyToOne(() => Rol)
  @JoinColumn({ name: 'rol_idrol' })
  rol!: Relation<Rol>;

  @ManyToOne(() => Empleado, (e) => e.roles)
  @JoinColumn({ name: 'empleado_idempleado' })
  empleado!: Relation<Empleado>;
}