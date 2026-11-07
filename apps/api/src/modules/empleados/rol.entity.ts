import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('rol')
export class Rol {
  @PrimaryGeneratedColumn({ name: 'idrol' }) idRol!: number;
  @Column({ type: 'varchar' }) nombre!: string;
  @Column({ type: 'varchar', nullable: true }) estado!: string | null;
}