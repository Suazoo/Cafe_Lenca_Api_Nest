import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class PerfilQueryDto {
  @ApiProperty({ example: 'maria@cafelenca.hn' })
  @IsEmail()
  correo!: string;
}