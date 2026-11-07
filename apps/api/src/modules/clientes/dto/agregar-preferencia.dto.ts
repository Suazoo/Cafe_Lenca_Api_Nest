import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AgregarPreferenciaDto {
  @ApiProperty({ example: 'bebida_favorita' })
  @IsString() @IsNotEmpty() @MaxLength(45)
  tipo!: string;

  @ApiProperty({ example: 'Café con leche' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  valor!: string;
}