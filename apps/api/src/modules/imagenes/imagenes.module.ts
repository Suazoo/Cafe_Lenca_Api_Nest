import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../ai/ai.module';
import { Producto } from '../menu/producto.entity';
import { ImagenesController } from './imagenes.controller';
import { ImagenesService } from './imagenes.service';
import { ProductoImagen } from './producto-imagen.entity';
import { UnsplashService } from './unsplash.service';

@Module({
  imports: [TypeOrmModule.forFeature([Producto, ProductoImagen]), AiModule],
  controllers: [ImagenesController],
  providers: [ImagenesService, UnsplashService],
})
export class ImagenesModule {}