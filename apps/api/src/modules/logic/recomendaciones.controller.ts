import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PerfilQueryDto } from '../clientes/dto/perfil-query.dto';
import { LogicService } from './logic.service';

@ApiTags('Recomendaciones (lógico – Prolog)')
@Controller('recomendaciones')
export class RecomendacionesController {
  constructor(private readonly logic: LogicService) {}

  @Get()
  @ApiOperation({ summary: 'Productos recomendados para el cliente (inferidos por Prolog)' })
  recomendar(@Query() q: PerfilQueryDto) {
    return this.logic.recomendacionesPorCorreo(q.correo);
  }

  @Get('descuento')
  @ApiOperation({ summary: 'Nivel y descuento del cliente (inferidos por Prolog)' })
  descuento(@Query() q: PerfilQueryDto) {
    return this.logic.descuentoPorCorreo(q.correo);
  }
}