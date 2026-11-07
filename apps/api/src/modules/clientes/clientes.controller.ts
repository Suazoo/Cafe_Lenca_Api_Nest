import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientesService } from './clientes.service';
import { AgregarPreferenciaDto } from './dto/agregar-preferencia.dto';
import { PerfilQueryDto } from './dto/perfil-query.dto';
import { RegistrarClienteDto } from './dto/registrar-cliente.dto';

@ApiTags('Clientes')
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @ApiOperation({ summary: 'Registra un cliente nuevo' })
  registrar(@Body() dto: RegistrarClienteDto) {
    return this.clientesService.registrar(dto);
  }

  @Get('perfil')
  @ApiOperation({ summary: 'Perfil del cliente por correo' })
  perfil(@Query() query: PerfilQueryDto) {
    return this.clientesService.perfilPorCorreo(query.correo);
  }

  @Post(':id/preferencias')
  @ApiOperation({ summary: 'Agrega una preferencia al cliente' })
  agregarPreferencia(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AgregarPreferenciaDto,
  ) {
    return this.clientesService.agregarPreferencia(id, dto);
  }
}