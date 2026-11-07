import { Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Persona } from '../personas/persona.entity';
import { RolHasEmpleado } from './rol-has-empleado.entity';

@Entity('empleado')
export class Empleado {
  @PrimaryGeneratedColumn({ name: 'idempleado' }) idEmpleado!: number;

  @OneToOne(() => Persona, { nullable: true })
  @JoinColumn({ name: 'persona_idpersona' })
  persona!: Relation<Persona> | null;

  @OneToMany(() => RolHasEmpleado, (r) => r.empleado)
  roles!: Relation<RolHasEmpleado[]>;
}