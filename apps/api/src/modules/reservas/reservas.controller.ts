import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CancelarReservaDto,
  CorreoQueryDto,
  CrearReservaDto,
  DisponibilidadQueryDto,
} from './dto/crear-reserva.dto';
import { ReservasService } from './reservas.service';

@ApiTags('Reservas')
@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Get('mesas-disponibles')
  @ApiOperation({ summary: 'Mesas libres para una fecha y cantidad de personas' })
  mesasDisponibles(@Query() q: DisponibilidadQueryDto) {
    return this.reservasService.mesasDisponibles(new Date(q.fecha), q.personas);
  }

  @Get('plano')
  @ApiOperation({ summary: 'Todas las mesas con su disponibilidad para una fecha y cantidad de personas' })
  plano(@Query() q: DisponibilidadQueryDto) {
    return this.reservasService.plano(new Date(q.fecha), q.personas);
  }

  @Post()
  @ApiOperation({ summary: 'Crea una reserva (asigna mesa automáticamente si no se elige)' })
  crear(@Body() dto: CrearReservaDto) {
    return this.reservasService.crear(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Reservas del cliente por correo' })
  listar(@Query() q: CorreoQueryDto) {
    return this.reservasService.listarPorCorreo(q.correo);
  }

  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancela una reserva activa' })
  cancelar(@Param('id', ParseIntPipe) id: number, @Body() dto: CancelarReservaDto) {
    return this.reservasService.cancelar(id, dto.correo);
  }
}