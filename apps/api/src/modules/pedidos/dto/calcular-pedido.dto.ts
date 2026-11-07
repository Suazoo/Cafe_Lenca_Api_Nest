import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class ItemPedidoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  productoId!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  @Max(50)
  cantidad!: number;
}

export class CalcularPedidoDto {
  @ApiProperty({ type: [ItemPedidoDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoDto)
  items!: ItemPedidoDto[];

  // Solo para probar el cálculo. Al guardar pedidos reales, el descuento lo
  // decidirá el servidor (motor Prolog), no el cliente.
  @ApiPropertyOptional({ description: 'Porcentaje de descuento (0-100)', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  descuentoPorcentaje?: number;
}