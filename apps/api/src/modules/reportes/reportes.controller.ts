import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';

@ApiTags('Reportes (declarativo)')
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportes: ReportesService) {}

  @Get('mas-vendidos')
  @ApiOperation({ summary: 'Productos más vendidos' })
  @ApiQuery({ name: 'limite', required: false, type: Number })
  masVendidos(@Query('limite', new ParseIntPipe({ optional: true })) limite?: number) {
    return this.reportes.masVendidos(limite ?? 5);
  }

  @Get('ventas-por-categoria')
  @ApiOperation({ summary: 'Unidades e ingresos por categoría' })
  ventasPorCategoria() {
    return this.reportes.ventasPorCategoria();
  }

  @Get('resumen-categorias')
  @ApiOperation({ summary: 'Cantidad, precio promedio y máximo por categoría' })
  resumenCategorias() {
    return this.reportes.resumenCategorias();
  }
}