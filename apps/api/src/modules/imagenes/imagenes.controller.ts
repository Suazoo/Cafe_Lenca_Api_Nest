import { Controller, Get, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AdminKeyGuard } from '../../common/guards/admin-key.guard';
import { ImagenesService } from './imagenes.service';

@ApiTags('Imágenes de productos (IA)')
@ApiHeader({ name: 'x-admin-key', required: true, description: 'Valor de ADMIN_KEY del archivo .env' })
@UseGuards(AdminKeyGuard)
@Controller('imagenes')
export class ImagenesController {
  constructor(private readonly imagenes: ImagenesService) {}

  @Get('estado')
  @ApiOperation({ summary: 'Cuántos productos tienen imagen y cómo va la sincronización' })
  estado() {
    return this.imagenes.resumen();
  }

  @Post('sincronizar')
  @ApiOperation({ summary: 'Busca con IA la imagen de los productos que no tienen (segundo plano)' })
  @ApiQuery({ name: 'forzar', required: false, type: Boolean, description: 'Rehace también los que ya tienen imagen' })
  @ApiQuery({ name: 'idProducto', required: false, type: Number, description: 'Solo este producto (siempre se rehace)' })
  @ApiQuery({ name: 'consulta', required: false, type: String, description: 'Búsqueda manual en inglés (con idProducto)' })
  sincronizar(
    @Query('forzar') forzar?: string,
    @Query('idProducto', new ParseIntPipe({ optional: true })) idProducto?: number,
    @Query('consulta') consulta?: string,
  ) {
    return this.imagenes.sincronizar({
      forzar: forzar === 'true' || idProducto !== undefined,
      idProducto,
      consulta,
    });
  }
}