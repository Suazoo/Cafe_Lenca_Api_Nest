import { Controller, Get, ParseFloatPipe, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MenuService } from './menu.service';

@ApiTags('Menú')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @ApiOperation({ summary: 'Menú de productos activos agrupados por categoría' })
  @ApiQuery({ name: 'categoria', required: false, type: Number })
  @ApiQuery({ name: 'maxPrecio', required: false, type: Number })
  @ApiQuery({ name: 'orden', required: false, enum: ['asc', 'desc'] })
  obtenerMenu(
    @Query('categoria', new ParseIntPipe({ optional: true })) categoriaId?: number,
    @Query('maxPrecio', new ParseFloatPipe({ optional: true })) precioMax?: number,
    @Query('orden') orden?: string,
  ) {
    return this.menuService.obtenerMenu({
      categoriaId,
      precioMax,
      orden: orden === 'desc' ? 'desc' : 'asc',
    });
  }
}