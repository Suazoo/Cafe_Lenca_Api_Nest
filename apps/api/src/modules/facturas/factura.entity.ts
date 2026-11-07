import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { numericTransformer } from '../../common/transformers/numeric.transformer';
import { Pedido } from '../pedidos/pedido.entity';

@Entity('factura')
export class Factura {
  @PrimaryGeneratedColumn({ name: 'idfactura' }) idFactura!: number;
  @Column({ name: 'numero_factura', type: 'varchar' }) numeroFactura!: string;
  @Column({ name: 'fecha_emision', type: 'timestamp', nullable: true }) fechaEmision!: Date | null;
  @Column({ type: 'numeric', transformer: numericTransformer }) subtotal!: number;
  @Column({ type: 'numeric', nullable: true, transformer: numericTransformer })
  descuento!: number | null;
  @Column({ type: 'numeric', transformer: numericTransformer }) impuesto!: number;
  @Column({ type: 'numeric', transformer: numericTransformer }) total!: number;

  @ManyToOne(() => Pedido, (p) => p.facturas, { nullable: true })
  @JoinColumn({ name: 'pedido_idpedido' })
  pedido!: Relation<Pedido> | null;
}