import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { BaristaService } from './barista.service';
import { ConversarBaristaDto } from './dto/conversar-barista.dto';

@ApiTags('Barista IA')
@UseGuards(ThrottlerGuard)
@Controller('barista')
export class BaristaController {
  constructor(private readonly barista: BaristaService) {}

  @Get('estado')
  @ApiOperation({ summary: 'Indica si el barista está disponible (IA configurada)' })
  estado() {
    return { disponible: this.barista.disponible };
  }

  @Post()
  @Throttle({ default: { limit: 6, ttl: 60_000 } })
  @ApiOperation({ summary: 'Conversa con el barista y recibe recomendaciones del menú real' })
  conversar(@Body() dto: ConversarBaristaDto) {
    return this.barista.conversar(dto);
  }
}