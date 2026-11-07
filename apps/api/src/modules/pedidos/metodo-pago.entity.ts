import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('metodopago')
export class MetodoPago {
  @PrimaryGeneratedColumn({ name: 'idmetodopago' }) idMetodoPago!: number;
  @Column({ type: 'varchar' }) nombre!: string;
  @Column({ type: 'varchar', nullable: true }) estado!: string | null;
}