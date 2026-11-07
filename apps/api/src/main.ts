import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Render pone un proxy delante: así el límite por IP ve la IP real del cliente
  app.set('trust proxy', 1);

  // Tolera errores comunes al escribir la variable: comillas, barra final, falta de https://
  const normalizarOrigen = (valor: string): string => {
    const limpio = valor.replace(/^["']|["']$/g, '').replace(/\/+$/, '').toLowerCase();
    return /^https?:\/\//.test(limpio) ? limpio : `https://${limpio}`;
  };

  // Orígenes permitidos: la web local y las direcciones de FRONTEND_URL (separadas por coma)
  const origenes = [
    'http://localhost:5173',
    ...(process.env.FRONTEND_URL ?? '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean)
      .map(normalizarOrigen),
  ];
  new Logger('CORS').log(`Orígenes permitidos: ${origenes.join(', ')}`);
  app.enableCors({ origin: origenes });

  const config = new DocumentBuilder()
    .setTitle('Café Lenca API')
    .setDescription('API del proyecto final ISC204 – Paradigmas de Programación')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();


  
