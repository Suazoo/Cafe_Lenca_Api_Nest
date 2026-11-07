import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from '../clientes/cliente.entity';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';
import { Reserva } from './reserva.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reserva, Cliente])],
  controllers: [ReservasController],
  providers: [ReservasService],
})
export class ReservasModule {}