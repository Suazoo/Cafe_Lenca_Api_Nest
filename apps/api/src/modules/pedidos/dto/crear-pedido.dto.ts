import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { ItemPedidoDto } from './calcular-pedido.dto';

export class CrearPedidoDto {
  @ApiProperty({ example: 'prueba@cafelenca.hn' })
  @IsEmail()
  correo!: string;

  @ApiProperty({ type: [ItemPedidoDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoDto)
  items!: ItemPedidoDto[];

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  metodoPagoId!: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  mesaId?: number;
}