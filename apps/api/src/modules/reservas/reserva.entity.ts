import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';
import { Mesa } from '../mesas/mesa.entity';

@Entity('reserva')
export class Reserva {
  @PrimaryGeneratedColumn({ name: 'idreserva' }) idReserva!: number;
  @Column({ name: 'fecha_reserva', type: 'timestamp' }) fechaReserva!: Date;
  @Column({ name: 'cantidad_persona', type: 'int' }) cantidadPersona!: number;
  @Column({ type: 'varchar', nullable: true }) estado!: string | null;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'cliente_idcliente' })
  cliente!: Relation<Cliente> | null;

  @ManyToOne(() => Mesa, { nullable: true })
  @JoinColumn({ name: 'mesa_idmesa' })
  mesa!: Relation<Mesa> | null;
}