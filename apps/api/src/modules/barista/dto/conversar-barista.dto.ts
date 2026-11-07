import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class MensajeHistorialDto {
  @ApiProperty({ enum: ['cliente', 'barista'] })
  @IsIn(['cliente', 'barista'])
  rol!: 'cliente' | 'barista';

  @ApiProperty()
  @IsString()
  @MaxLength(700)
  texto!: string;
}

export class ConversarBaristaDto {
  @ApiProperty({ example: 'Algo dulce y frío que cueste poco' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  mensaje!: string;

  @ApiPropertyOptional({ type: [MensajeHistorialDto], description: 'Hasta los últimos 6 mensajes' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => MensajeHistorialDto)
  historial?: MensajeHistorialDto[];
}