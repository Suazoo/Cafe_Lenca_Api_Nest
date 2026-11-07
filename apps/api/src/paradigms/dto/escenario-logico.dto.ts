import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class EscenarioLogicoQueryDto {
  @ApiPropertyOptional({ example: 3, description: 'Pedidos en los últimos 30 días' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1000)
  pedidosMes?: number;

  @ApiPropertyOptional({ example: 12, description: 'Pedidos totales del cliente' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10000)
  pedidosTotal?: number;

  @ApiPropertyOptional({ example: 800, description: 'Gasto acumulado en lempiras' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1_000_000)
  gasto?: number;
}