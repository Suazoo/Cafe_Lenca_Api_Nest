import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { MenuModule } from './modules/menu/menu.module';
import { ReportesModule } from './modules/reportes/reportes.module';
import { PedidosModule } from './modules/pedidos/pedidos.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { ReservasModule } from './modules/reservas/reservas.module';
import { LogicModule } from './modules/logic/logic.module';
import { ParadigmsModule } from './paradigms/paradigms.module';
import { ImagenesModule } from './modules/imagenes/imagenes.module';
import { BaristaModule } from './modules/barista/barista.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow<string>('DATABASE_URL'),
        ssl: { rejectUnauthorized: false }, // Supabase exige SSL
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // la BD ya existe: TypeORM NO debe modificarla
      }),
    }),
    MenuModule,
    PedidosModule,
    ReportesModule,
    ClientesModule,
    ReservasModule,
    LogicModule,
    ParadigmsModule,
    ImagenesModule,
    BaristaModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}