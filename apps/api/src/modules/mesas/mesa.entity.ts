import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('mesa')
export class Mesa {
  @PrimaryGeneratedColumn({ name: 'idmesa' }) idMesa!: number;
  @Column({ type: 'int' }) numero!: number;
  @Column({ type: 'int' }) capacidad!: number;
  @Column({ type: 'varchar', nullable: true }) estado!: string | null;
}