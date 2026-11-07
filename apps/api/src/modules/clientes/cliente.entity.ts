import { Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Persona } from '../personas/persona.entity';
import { PreferenciaCliente } from './preferencia-cliente.entity';

@Entity('cliente')
export class Cliente {
  @PrimaryGeneratedColumn({ name: 'idcliente' }) idCliente!: number;

  @OneToOne(() => Persona, { nullable: true })
  @JoinColumn({ name: 'persona_idpersona' })
  persona!: Relation<Persona> | null;

  @OneToMany(() => PreferenciaCliente, (p) => p.cliente)
  preferencias!: Relation<PreferenciaCliente[]>;
}