import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Telefono } from './telefono.entity';

@Entity('persona')
export class Persona {
  @PrimaryGeneratedColumn({ name: 'idpersona' }) idPersona!: number;
  @Column({ name: 'pnombre', type: 'varchar' }) pNombre!: string;
  @Column({ name: 'snombre', type: 'varchar', nullable: true }) sNombre!: string | null;
  @Column({ name: 'papellido', type: 'varchar' }) pApellido!: string;
  @Column({ name: 'sapellido', type: 'varchar', nullable: true }) sApellido!: string | null;
  @Column({ type: 'varchar' }) correo!: string;
  @Column({ name: 'fecha_registro', type: 'timestamp', nullable: true }) fechaRegistro!: Date | null;

  @OneToMany(() => Telefono, (t) => t.persona)
  telefonos!: Relation<Telefono[]>;
}