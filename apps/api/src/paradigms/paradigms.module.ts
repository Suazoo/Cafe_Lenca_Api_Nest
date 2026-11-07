import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogicModule } from '../modules/logic/logic.module';
import { Producto } from '../modules/menu/producto.entity';
import { ReportesModule } from '../modules/reportes/reportes.module';
import { ParadigmsController } from './paradigms.controller';
import { ParadigmsService } from './paradigms.service';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }]), TypeOrmModule.forFeature([Producto]), LogicModule, ReportesModule],
  controllers: [ParadigmsController],
  providers: [ParadigmsService],
})
export class ParadigmsModule {}