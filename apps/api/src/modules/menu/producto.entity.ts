import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { numericTransformer } from '../../common/transformers/numeric.transformer';
import { Categoria } from './categoria.entity';

@Entity('producto')
export class Producto {
  @PrimaryGeneratedColumn({ name: 'idproducto' }) idProducto!: number;
  @Column({ type: 'varchar' }) nombre!: string;
  @Column({ type: 'varchar', nullable: true }) descripcion!: string | null;
  @Column({ type: 'numeric', transformer: numericTransformer }) precio!: number;
  @Column({ type: 'varchar', nullable: true }) estado!: string | null;

  @ManyToOne(() => Categoria, (c) => c.productos, { nullable: true })
  @JoinColumn({ name: 'categoria_idcategoria' })
  categoria!: Relation<Categoria> | null;
}