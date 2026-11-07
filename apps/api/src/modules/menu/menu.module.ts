import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { Producto } from './producto.entity';
import { ProductoImagen } from '../imagenes/producto-imagen.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Producto, ProductoImagen])],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}