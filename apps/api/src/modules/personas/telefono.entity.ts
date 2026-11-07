import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Persona } from './persona.entity';

@Entity('telefono')
export class Telefono {
  @PrimaryGeneratedColumn({ name: 'idtelefono' }) idTelefono!: number;
  @Column({ type: 'varchar' }) numero!: string;

  @ManyToOne(() => Persona, (p) => p.telefonos, { nullable: true })
  @JoinColumn({ name: 'persona_idpersona' })
  persona!: Relation<Persona> | null;
}