import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { numericTransformer } from '../../common/transformers/numeric.transformer';
import { Ingrediente } from './ingrediente.entity';

@Entity('inventario')
export class Inventario {
  @PrimaryGeneratedColumn({ name: 'idinventario' }) idInventario!: number;
  @Column({ name: 'cantidad_actual', type: 'numeric', transformer: numericTransformer })
  cantidadActual!: number;
  @Column({ name: 'cantidad_minima', type: 'numeric', transformer: numericTransformer })
  cantidadMinima!: number;
  @Column({ name: 'ultima_actualizacion', type: 'timestamp', nullable: true })
  ultimaActualizacion!: Date | null;

  @OneToOne(() => Ingrediente, { nullable: true })
  @JoinColumn({ name: 'ingrediente_idingrediente' })
  ingrediente!: Relation<Ingrediente> | null;
}