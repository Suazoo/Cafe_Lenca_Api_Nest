import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogicModule } from '../logic/logic.module';
import { Producto } from '../menu/producto.entity';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { MetodoPago } from './metodo-pago.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Pedido } from './pedido.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, MetodoPago, Pedido, Cliente]), LogicModule],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}