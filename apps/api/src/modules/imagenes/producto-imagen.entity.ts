import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('producto_imagen')
export class ProductoImagen {
  @PrimaryColumn({ name: 'idproducto', type: 'int' }) idProducto!: number;
  @Column({ type: 'text' }) url!: string;
  @Column({ name: 'url_grande', type: 'text', nullable: true }) urlGrande!: string | null;
  @Column({ type: 'varchar', length: 150, nullable: true }) fotografo!: string | null;
  @Column({ name: 'fotografo_url', type: 'text', nullable: true }) fotografoUrl!: string | null;
  @Column({ name: 'pagina_url', type: 'text', nullable: true }) paginaUrl!: string | null;
  @Column({ type: 'varchar', length: 20, nullable: true }) fuente!: string | null;
  @Column({ type: 'varchar', length: 200, nullable: true }) consulta!: string | null;
  @Column({ type: 'timestamp', default: () => 'now()' }) fecha!: Date;
}