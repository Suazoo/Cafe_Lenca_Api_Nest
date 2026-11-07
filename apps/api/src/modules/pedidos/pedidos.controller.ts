import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PerfilQueryDto } from '../clientes/dto/perfil-query.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CalcularPedidoDto } from './dto/calcular-pedido.dto';
import { PedidosService } from './pedidos.service';
import { CrearPedidoDto } from './dto/crear-pedido.dto';


@ApiTags('Pedidos')
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Get('metodos-pago')
  @ApiOperation({ summary: 'Métodos de pago disponibles' })
  metodosPago() {
    return this.pedidosService.listarMetodosPago();
  }

  @Get('estadisticas')
  @ApiOperation({ summary: 'Estadísticas de consumo del cliente' })
  estadisticas(@Query() q: PerfilQueryDto) {
    return this.pedidosService.estadisticas(q.correo);
  }

  @Get()
  @ApiOperation({ summary: 'Historial de pedidos del cliente, con su factura' })
  historial(@Query() q: PerfilQueryDto) {
    return this.pedidosService.historial(q.correo);
  }

  @Post('calcular')
  @ApiOperation({ summary: 'Calcula subtotal, descuento, impuesto y total (sin guardar)' })
  calcular(@Body() dto: CalcularPedidoDto) {
    return this.pedidosService.calcular(dto);
  }
  
  @Post()
  @ApiOperation({ summary: 'Crea un pedido y genera su factura' })
  crear(@Body() dto: CrearPedidoDto) {
    return this.pedidosService.crear(dto);
  }
}