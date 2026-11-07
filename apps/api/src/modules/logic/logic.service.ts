import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { DescuentoClienteDto, NivelCliente, RecomendacionDto } from '@cafe-lenca/shared';
import { ESTADO_ACTIVO } from '../../common/constants/estado';
import { Cliente } from '../clientes/cliente.entity';
import { Producto } from '../menu/producto.entity';
import { Pedido } from '../pedidos/pedido.entity';
import { ReportesService } from '../reportes/reportes.service';
import { construirHechos } from './hechos.builder';
import type { DatosCliente } from './hechos.builder';
import { BASE_CONOCIMIENTO } from './knowledge-base';
import { LogicEngineService } from './logic-engine.service';
import type { Solucion } from './logic-engine.service';

const DIAS_VENTANA = 30;
const MS_DIA = 86_400_000;
const MAX_RECOMENDACIONES = 5;

const NIVELES: Record<string, NivelCliente> = {
  vip: 'VIP',
  frecuente: 'FRECUENTE',
  nuevo: 'NUEVO',
  regular: 'REGULAR',
};

// Menor número = más relevante
const PRIORIDAD: Record<string, number> = {
  preferencia: 1,
  categoria_favorita: 2,
  misma_categoria: 3,
  popular: 4,
};

const MOTIVOS: Record<string, string> = {
  preferencia: 'Coincide con tus preferencias',
  categoria_favorita: 'Es de tu categoría favorita',
  misma_categoria: 'Es de una categoría que ya pediste',
  popular: 'Es de los más vendidos',
};

@Injectable()
export class LogicService {
  constructor(
    private readonly motor: LogicEngineService,
    private readonly reportes: ReportesService,
    @InjectRepository(Cliente) private readonly clientes: Repository<Cliente>,
    @InjectRepository(Pedido) private readonly pedidos: Repository<Pedido>,
    @InjectRepository(Producto) private readonly productos: Repository<Producto>,
  ) {}

  private async idClientePorCorreo(correo: string): Promise<number> {
    const cliente = await this.clientes.findOne({ where: { persona: { correo } } });
    if (!cliente) {
      throw new NotFoundException('No existe un cliente registrado con ese correo');
    }
    return cliente.idCliente;
  }

  // La BD aporta los datos; las decisiones las toma Prolog
  private async cargarDatos(idCliente: number): Promise<DatosCliente> {
    const [cliente, pedidos, productos, populares] = await Promise.all([
      this.clientes.findOne({ where: { idCliente }, relations: { preferencias: true } }),
      this.pedidos.find({
        where: { cliente: { idCliente } },
        relations: { detalles: true, facturas: true },
      }),
      this.productos.find({ where: { estado: ESTADO_ACTIVO }, relations: { categoria: true } }),
      this.reportes.masVendidos(3),
    ]);
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    const desde = Date.now() - DIAS_VENTANA * MS_DIA;
    return {
      idCliente,
      pedidosMes: pedidos.filter((p) => (p.fechaPedido?.getTime() ?? 0) >= desde).length,
      pedidosTotal: pedidos.length,
      gastoTotal: pedidos.flatMap((p) => p.facturas).reduce((suma, f) => suma + f.total, 0),
      compras: [...new Set(pedidos.flatMap((p) => p.detalles).map((d) => d.productoId))],
      preferencias: cliente.preferencias.map((p) => ({ tipo: p.tipoPreferencia, valor: p.valor })),
      productos: productos.map((p) => ({
        id: p.idProducto,
        nombre: p.nombre,
        categoria: p.categoria?.nombre ?? null,
        precio: p.precio,
      })),
      populares: populares.map((p) => p.id),
    };
  }

  async evaluarDescuento(idCliente: number): Promise<DescuentoClienteDto> {
    const datos = await this.cargarDatos(idCliente);
    const [fila] = await this.motor.consultar(
      `${BASE_CONOCIMIENTO}\n${construirHechos(datos)}`,
      `nivel(${idCliente}, N), porcentaje(N, D)`,
      ['N', 'D'],
      1,
    );
    return {
      idCliente,
      nivel: NIVELES[String(fila?.N)] ?? 'REGULAR',
      descuentoPorcentaje: Number(fila?.D ?? 0),
      pedidosUltimos30Dias: datos.pedidosMes,
      pedidosTotales: datos.pedidosTotal,
      gastoTotal: Math.round(datos.gastoTotal * 100) / 100,
    };
  }

  async recomendar(idCliente: number): Promise<RecomendacionDto[]> {
    const datos = await this.cargarDatos(idCliente);
    const soluciones = await this.motor.consultar(
      `${BASE_CONOCIMIENTO}\n${construirHechos(datos)}`,
      `recomendar(${idCliente}, P, R)`,
      ['P', 'R'],
      100,
    );
    return this.consolidar(soluciones, datos);
  }

  descuentoPorCorreo(correo: string) {
    return this.idClientePorCorreo(correo).then((id) => this.evaluarDescuento(id));
  }

  recomendacionesPorCorreo(correo: string) {
    return this.idClientePorCorreo(correo).then((id) => this.recomendar(id));
  }

  // Un producto puede salir por varias reglas: se conserva la más relevante
  private consolidar(soluciones: Solucion[], datos: DatosCliente): RecomendacionDto[] {
    const mejorMotivo = soluciones.reduce((mapa, s) => {
      const id = Number(s.P);
      const motivo = String(s.R);
      const actual = mapa.get(id);
      return actual === undefined || (PRIORIDAD[motivo] ?? 99) < (PRIORIDAD[actual] ?? 99)
        ? new Map(mapa).set(id, motivo)
        : mapa;
    }, new Map<number, string>());

    return [...mejorMotivo.entries()]
      .sort(([, a], [, b]) => (PRIORIDAD[a] ?? 99) - (PRIORIDAD[b] ?? 99))
      .slice(0, MAX_RECOMENDACIONES)
      .flatMap(([id, motivo]) => {
        const p = datos.productos.find((x) => x.id === id);
        return p
          ? [
              {
                productoId: p.id,
                nombre: p.nombre,
                categoria: p.categoria,
                precio: p.precio,
                motivo: MOTIVOS[motivo] ?? motivo,
              },
            ]
          : [];
      });
  }
}