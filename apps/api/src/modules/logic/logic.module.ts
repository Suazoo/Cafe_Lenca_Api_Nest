import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from '../clientes/cliente.entity';
import { Producto } from '../menu/producto.entity';
import { Pedido } from '../pedidos/pedido.entity';
import { ReportesModule } from '../reportes/reportes.module';
import { LogicEngineService } from './logic-engine.service';
import { LogicService } from './logic.service';
import { RecomendacionesController } from './recomendaciones.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, Pedido, Producto]), ReportesModule],
  controllers: [RecomendacionesController],
  providers: [LogicEngineService, LogicService],
  exports: [LogicEngineService, LogicService],
})
export class LogicModule {}