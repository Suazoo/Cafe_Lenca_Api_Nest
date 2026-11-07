import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Producto } from './producto.entity';

@Entity('categoria')
export class Categoria {
  @PrimaryGeneratedColumn({ name: 'idcategoria' }) idCategoria!: number;
  @Column({ type: 'varchar' }) nombre!: string;
  @Column({ type: 'varchar', nullable: true }) descripcion!: string | null;
  @Column({ type: 'varchar', nullable: true }) estado!: string | null;

  @OneToMany(() => Producto, (p) => p.categoria)
  productos!: Relation<Producto[]>;
}