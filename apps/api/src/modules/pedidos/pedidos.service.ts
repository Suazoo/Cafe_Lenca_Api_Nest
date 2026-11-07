import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import type {
  CrearPedidoRespuestaDto,
  EstadisticasClienteDto,
  MetodoPagoDto,
  PedidoHistorialDto,
} from '@cafe-lenca/shared';
import { aHistorial, calcularEstadisticas } from './pedidos.stats';
import { ESTADO_ACTIVO } from '../../common/constants/estado';
import { Cliente } from '../clientes/cliente.entity';
import { calcularFactura } from '../facturas/billing.calculator';
import type { LineaEntrada } from '../facturas/billing.calculator';
import { Factura } from '../facturas/factura.entity';
import { Producto } from '../menu/producto.entity';
import { Mesa } from '../mesas/mesa.entity';
import type { CalcularPedidoDto, ItemPedidoDto } from './dto/calcular-pedido.dto';
import type { CrearPedidoDto } from './dto/crear-pedido.dto';
import { DetallePedido } from './detalle-pedido.entity';
import { MetodoPago } from './metodo-pago.entity';
import { Pedido } from './pedido.entity';
import { LogicService } from '../logic/logic.service';



@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productos: Repository<Producto>,
    @InjectRepository(MetodoPago)
    private readonly metodosPago: Repository<MetodoPago>,
    @InjectRepository(Pedido)
    private readonly pedidos: Repository<Pedido>,
    @InjectRepository(Cliente)
    private readonly clientes: Repository<Cliente>,
    private readonly dataSource: DataSource,
    private readonly logic: LogicService,
  ) {}

  // Los precios SIEMPRE se leen de la BD: nunca se confía en el cliente.
  private async prepararLineas(items: ItemPedidoDto[]): Promise<LineaEntrada[]> {
    // Si el mismo producto llega dos veces, se suman sus cantidades
    const cantidades = new Map<number, number>();
    for (const item of items) {
      cantidades.set(item.productoId, (cantidades.get(item.productoId) ?? 0) + item.cantidad);
    }

    const encontrados = await this.productos.find({
      where: { idProducto: In([...cantidades.keys()]) },
    });

    return [...cantidades.entries()].map(([productoId, cantidad]) => {
      const producto = encontrados.find((p) => p.idProducto === productoId);
      if (!producto || producto.estado !== ESTADO_ACTIVO) {
        throw new BadRequestException(`El producto ${productoId} no existe o no está disponible`);
      }
      return {
        productoId: producto.idProducto,
        nombre: producto.nombre,
        precioUnitario: producto.precio,
        cantidad,
      };
    });
  }

    // Catálogo de solo lectura
  async listarMetodosPago(): Promise<MetodoPagoDto[]> {
    const lista = await this.metodosPago.find({
      where: { estado: ESTADO_ACTIVO },
      order: { nombre: 'ASC' },
    });
    return lista.map((m) => ({ id: m.idMetodoPago, nombre: m.nombre }));
  }

    // La BD aporta los datos; el armado del historial y las estadísticas es función pura
  private async historialDe(correo: string): Promise<PedidoHistorialDto[]> {
    const cliente = await this.clientes.findOne({ where: { persona: { correo } } });
    if (!cliente) {
      throw new NotFoundException('No existe un cliente registrado con ese correo');
    }
    const pedidos = await this.pedidos.find({
      where: { cliente: { idCliente: cliente.idCliente } },
      relations: {
        detalles: { producto: { categoria: true } },
        facturas: true,
        mesa: true,
        metodoPago: true,
      },
      order: { fechaPedido: 'DESC' },
    });
    return pedidos.map(aHistorial);
  }

  historial(correo: string): Promise<PedidoHistorialDto[]> {
    return this.historialDe(correo);
  }

  async estadisticas(correo: string): Promise<EstadisticasClienteDto> {
    return calcularEstadisticas(await this.historialDe(correo));
  }

  async calcular(dto: CalcularPedidoDto) {
    const lineas = await this.prepararLineas(dto.items);
    return calcularFactura(lineas, dto.descuentoPorcentaje ?? 0);
  }

  async crear(dto: CrearPedidoDto): Promise<CrearPedidoRespuestaDto> {
    const lineas = await this.prepararLineas(dto.items);
    

    // Transacción: pedido + detalles + factura se guardan juntos o no se guarda nada
    return this.dataSource.transaction(async (manager) => {
      const cliente = await manager.findOne(Cliente, {
        where: { persona: { correo: dto.correo } },
      });
      if (!cliente) {
        throw new NotFoundException('No existe un cliente registrado con ese correo');
      }
      // El descuento lo decide el motor Prolog según el historial del cliente
      const decision = await this.logic.evaluarDescuento(cliente.idCliente);
      const factura = calcularFactura(lineas, decision.descuentoPorcentaje);

      const metodoPago = await manager.findOneBy(MetodoPago, {
        idMetodoPago: dto.metodoPagoId,
      });
      if (!metodoPago || metodoPago.estado !== ESTADO_ACTIVO) {
        throw new BadRequestException('El método de pago no es válido');
      }

      let mesa: Mesa | null = null;
      if (dto.mesaId !== undefined) {
        mesa = await manager.findOneBy(Mesa, { idMesa: dto.mesaId });
        if (!mesa) {
          throw new BadRequestException('La mesa indicada no existe');
        }
      }

      const pedido = await manager.save(
        manager.create(Pedido, {
          fechaPedido: new Date(),
          estado: ESTADO_ACTIVO, // pedido recién creado
          cliente,
          mesa,
          metodoPago,
        }),
      );

      await manager.insert(
        DetallePedido,
        factura.lineas.map((l) => ({
          pedidoId: pedido.idPedido,
          productoId: l.productoId,
          cantidad: l.cantidad,
          precioUnitario: l.precioUnitario,
        })),
      );

      const anio = new Date().getFullYear();
      const facturaGuardada = await manager.save(
        manager.create(Factura, {
          numeroFactura: `LEN-${anio}-${String(pedido.idPedido).padStart(6, '0')}`,
          fechaEmision: new Date(),
          subtotal: factura.subtotal,
          descuento: factura.descuento,
          impuesto: factura.impuesto,
          total: factura.total,
          pedido,
        }),
      );

      return {
        idPedido: pedido.idPedido,
        numeroFactura: facturaGuardada.numeroFactura,
        factura,
        nivelCliente: decision.nivel,
        descuentoPorcentaje: decision.descuentoPorcentaje,
      };
    });
  }
}