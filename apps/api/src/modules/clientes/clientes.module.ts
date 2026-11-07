import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Persona } from '../personas/persona.entity';
import { Telefono } from '../personas/telefono.entity';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { Cliente } from './cliente.entity';
import { PreferenciaCliente } from './preferencia-cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, Persona, Telefono, PreferenciaCliente])],
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [ClientesService],
})
export class ClientesModule {}