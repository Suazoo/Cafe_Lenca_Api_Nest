import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EscenarioLogicoQueryDto } from './dto/escenario-logico.dto';
import { ParadigmsService } from './paradigms.service';

@ApiTags('Paradigmas (demostración)')
@UseGuards(ThrottlerGuard)
@Controller('paradigms')
export class ParadigmsController {
  constructor(private readonly paradigms: ParadigmsService) {}

  @Get('imperativo')
  @ApiOperation({ summary: 'Demostración del paradigma imperativo' })
  imperativo() {
    return this.paradigms.imperativo();
  }

  @Get('oop')
  @ApiOperation({ summary: 'Demostración de la programación orientada a objetos' })
  oop() {
    return this.paradigms.oop();
  }

  @Get('funcional')
  @ApiOperation({ summary: 'Demostración del paradigma funcional' })
  funcional() {
    return this.paradigms.funcional();
  }

  @Get('logico')
  @ApiOperation({ summary: 'Simulador del paradigma lógico (Prolog) con un cliente de ejemplo' })
  logico(@Query() q: EscenarioLogicoQueryDto) {
    return this.paradigms.logico({
      pedidosMes: q.pedidosMes ?? 3,
      pedidosTotal: q.pedidosTotal ?? 12,
      gasto: q.gasto ?? 800,
    });
  }

  @Get('declarativo')
  @ApiOperation({ summary: 'Demostración del paradigma declarativo (SQL)' })
  declarativo() {
    return this.paradigms.declarativo();
  }

  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Get('rendimiento')
  @ApiOperation({ summary: 'Mide el tiempo de ejecución del código de cada paradigma' })
  rendimiento() {
    return this.paradigms.rendimiento();
  }
}