import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { numericTransformer } from '../../common/transformers/numeric.transformer';
import { Producto } from '../menu/producto.entity';
import { Pedido } from './pedido.entity';

@Entity('detallepedido')
export class DetallePedido {
  @PrimaryColumn({ name: 'producto_idproducto', type: 'int' }) productoId!: number;
  @PrimaryColumn({ name: 'pedido_idpedido', type: 'int' }) pedidoId!: number;
  @Column({ type: 'int' }) cantidad!: number;
  @Column({ name: 'precio_unitario', type: 'numeric', transformer: numericTransformer })
  precioUnitario!: number;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_idproducto' })
  producto!: Relation<Producto>;

  @ManyToOne(() => Pedido, (p) => p.detalles)
  @JoinColumn({ name: 'pedido_idpedido' })
  pedido!: Relation<Pedido>;
}