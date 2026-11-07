import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type {
  ProductoMasVendidoDto,
  ResumenCategoriaDto,
  VentasCategoriaDto,
} from '@cafe-lenca/shared';
import { ESTADO_ACTIVO } from '../../common/constants/estado';
import {
  SQL_MAS_VENDIDOS,
  SQL_RESUMEN_CATEGORIAS,
  SQL_VENTAS_POR_CATEGORIA,
} from './reportes.queries';

@Injectable()
export class ReportesService {
  constructor(private readonly dataSource: DataSource) {}

  masVendidos(limite: number) {
    return this.dataSource.query<ProductoMasVendidoDto[]>(SQL_MAS_VENDIDOS, [limite]);
  }

  ventasPorCategoria() {
    return this.dataSource.query<VentasCategoriaDto[]>(SQL_VENTAS_POR_CATEGORIA);
  }

  resumenCategorias() {
    return this.dataSource.query<ResumenCategoriaDto[]>(SQL_RESUMEN_CATEGORIAS, [ESTADO_ACTIVO]);
  }
}