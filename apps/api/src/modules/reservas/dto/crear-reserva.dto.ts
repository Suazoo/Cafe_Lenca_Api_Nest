import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsISO8601, IsOptional, Max, Min } from 'class-validator';

export class CrearReservaDto {
  @ApiProperty({ example: 'maria@cafelenca.hn' })
  @IsEmail()
  correo!: string;

  @ApiProperty({ example: '2026-11-20T19:00:00-06:00', description: 'Fecha ISO 8601 con zona horaria' })
  @IsISO8601()
  fecha!: string;

  @ApiProperty({ example: 2 })
  @IsInt() @Min(1) @Max(20)
  personas!: number;

  @ApiPropertyOptional({ example: 3, description: 'Si se omite, se asigna la mesa más pequeña disponible' })
  @IsOptional() @IsInt() @Min(1)
  mesaId?: number;
}

export class DisponibilidadQueryDto {
  @ApiProperty({ example: '2026-11-20T19:00:00-06:00' })
  @IsISO8601()
  fecha!: string;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt() @Min(1) @Max(20)
  personas!: number;
}

export class CorreoQueryDto {
  @ApiProperty({ example: 'maria@cafelenca.hn' })
  @IsEmail()
  correo!: string;
}

export class CancelarReservaDto {
  @ApiProperty({ example: 'maria@cafelenca.hn' })
  @IsEmail()
  correo!: string;
}