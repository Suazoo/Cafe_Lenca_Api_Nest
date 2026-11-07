import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class RegistrarClienteDto {
  @ApiProperty({ example: 'María' })
  @IsString() @IsNotEmpty() @MaxLength(45)
  pNombre!: string;

  @ApiPropertyOptional({ example: 'José' })
  @IsOptional() @IsString() @MaxLength(45)
  sNombre?: string;

  @ApiProperty({ example: 'Suazo' })
  @IsString() @IsNotEmpty() @MaxLength(45)
  pApellido!: string;

  @ApiPropertyOptional({ example: 'Reyes' })
  @IsOptional() @IsString() @MaxLength(45)
  sApellido?: string;

  @ApiProperty({ example: 'maria@cafelenca.hn' })
  @IsEmail() @MaxLength(100)
  correo!: string;

  @ApiPropertyOptional({ example: '+504 9999-0000' })
  @IsOptional() @IsString() @MaxLength(45)
  telefono?: string;
}