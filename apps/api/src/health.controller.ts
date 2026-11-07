import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  async check() {
    const [row] = await this.dataSource.query('SELECT now() AS ahora');
    return { db: 'ok', ahora: row.ahora };
  }

  @Get('entidades')
  async entidades() {
    const resultado: Record<string, string> = {};
    for (const meta of this.dataSource.entityMetadatas) {
      try {
        await this.dataSource.getRepository(meta.target).find({ take: 1 });
        resultado[meta.tableName] = 'ok';
      } catch (e) {
        resultado[meta.tableName] = (e as Error).message;
      }
    }
    return resultado;
  }
}