import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Cliente } from './cliente.entity';

@Entity('preferenciacliente')
export class PreferenciaCliente {
  @PrimaryGeneratedColumn({ name: 'idpreferencia' }) idPreferencia!: number;
  @Column({ name: 'tipo_preferencia', type: 'varchar' }) tipoPreferencia!: string;
  @Column({ type: 'varchar' }) valor!: string;

  @ManyToOne(() => Cliente, (c) => c.preferencias, { nullable: true })
  @JoinColumn({ name: 'cliente_idcliente' })
  cliente!: Relation<Cliente> | null;
}