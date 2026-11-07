import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AiModule } from '../ai/ai.module';
import { MenuModule } from '../menu/menu.module';
import { BaristaController } from './barista.controller';
import { BaristaService } from './barista.service';

@Module({
  imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 20 }]), AiModule, MenuModule],
  controllers: [BaristaController],
  providers: [BaristaService],
})
export class BaristaModule {}