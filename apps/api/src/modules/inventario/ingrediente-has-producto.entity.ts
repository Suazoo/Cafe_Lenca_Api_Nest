import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { numericTransformer } from '../../common/transformers/numeric.transformer';
import { Producto } from '../menu/producto.entity';
import { Ingrediente } from './ingrediente.entity';

@Entity('ingrediente_has_producto')
export class IngredienteHasProducto {
  @PrimaryColumn({ name: 'ingrediente_idingrediente', type: 'int' }) ingredienteId!: number;
  @PrimaryColumn({ name: 'producto_idproducto', type: 'int' }) productoId!: number;
  @Column({ type: 'numeric', transformer: numericTransformer }) cantidad!: number;

  @ManyToOne(() => Ingrediente)
  @JoinColumn({ name: 'ingrediente_idingrediente' })
  ingrediente!: Relation<Ingrediente>;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'producto_idproducto' })
  producto!: Relation<Producto>;
}