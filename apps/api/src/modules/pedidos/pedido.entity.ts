import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Cliente } from '../clientes/cliente.entity';
import { Empleado } from '../empleados/empleado.entity';
import { Factura } from '../facturas/factura.entity';
import { Mesa } from '../mesas/mesa.entity';
import { DetallePedido } from './detalle-pedido.entity';
import { MetodoPago } from './metodo-pago.entity';

@Entity('pedido')
export class Pedido {
  @PrimaryGeneratedColumn({ name: 'idpedido' }) idPedido!: number;
  @Column({ name: 'fecha_pedido', type: 'timestamp', nullable: true }) fechaPedido!: Date | null;
  @Column({ type: 'varchar', nullable: true }) estado!: string | null;

  @ManyToOne(() => Cliente, { nullable: true })
  @JoinColumn({ name: 'cliente_idcliente' })
  cliente!: Relation<Cliente> | null;

  @ManyToOne(() => Mesa, { nullable: true })
  @JoinColumn({ name: 'mesa_idmesa' })
  mesa!: Relation<Mesa> | null;

  @ManyToOne(() => MetodoPago, { nullable: true })
  @JoinColumn({ name: 'metodopago_idmetodopago' })
  metodoPago!: Relation<MetodoPago> | null;

  @ManyToOne(() => Empleado, { nullable: true })
  @JoinColumn({ name: 'empleado_idempleado' })
  empleado!: Relation<Empleado> | null;

  @OneToMany(() => DetallePedido, (d) => d.pedido)
  detalles!: Relation<DetallePedido[]>;

  @OneToMany(() => Factura, (f) => f.pedido)
  facturas!: Relation<Factura[]>;
}