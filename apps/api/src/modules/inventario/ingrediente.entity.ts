import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ingrediente')
export class Ingrediente {
  @PrimaryGeneratedColumn({ name: 'idingrediente' }) idIngrediente!: number;
  @Column({ type: 'varchar' }) nombre!: string;
  @Column({ name: 'unidad_medida', type: 'varchar' }) unidadMedida!: string;
  @Column({ type: 'varchar', nullable: true }) estado!: string | null;
}