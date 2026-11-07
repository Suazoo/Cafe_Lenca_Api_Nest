import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { aImagenDto } from '../imagenes/imagen.mapper';
import { ProductoImagen } from '../imagenes/producto-imagen.entity';
import { conImagenes, construirMenu } from './menu.functions';
import type { FiltrosMenu } from './menu.functions';
import { Producto } from './producto.entity';

@Injectable()
export class MenuService {
  private readonly log = new Logger(MenuService.name);

  constructor(
    @InjectRepository(Producto) private readonly productos: Repository<Producto>,
    @InjectRepository(ProductoImagen) private readonly imagenes: Repository<ProductoImagen>,
  ) {}

  // El service solo lee de la BD; la transformación es función pura.
  async obtenerMenu(filtros: FiltrosMenu) {
    const [todos, fotos] = await Promise.all([
      this.productos.find({ relations: { categoria: true } }),
      // Si las imágenes fallan, el menú sigue funcionando sin ellas
      this.imagenes.find().catch((e: unknown) => {
        this.log.warn(`No se pudieron leer las imágenes: ${e instanceof Error ? e.message : 'error'}`);
        return [] as ProductoImagen[];
      }),
    ]);
    const porProducto = new Map(fotos.map((f) => [f.idProducto, aImagenDto(f)] as const));
    return conImagenes(construirMenu(todos, filtros), porProducto);
  }
}