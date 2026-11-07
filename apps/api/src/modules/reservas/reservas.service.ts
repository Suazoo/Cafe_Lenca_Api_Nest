import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, Repository } from 'typeorm';
import type { EntityManager } from 'typeorm';
import type { MesaDisponibleDto, MesaPlanoDto, ReservaDto } from '@cafe-lenca/shared';
import {
  ESTADO_ACTIVO,
  ESTADO_RESERVA_ACTIVA,
  ESTADO_RESERVA_CANCELADA,
} from '../../common/constants/estado';
import { Cliente } from '../clientes/cliente.entity';
import { Mesa } from '../mesas/mesa.entity';
import type { CrearReservaDto } from './dto/crear-reserva.dto';
import { Reserva } from './reserva.entity';
import {
  CANCELACION_MINIMA_MIN,
  DURACION_RESERVA_MIN,
  mesasLibres,
  puedeCancelar,
  validarFecha,
} from './reservas.rules';


@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva) private readonly reservas: Repository<Reserva>,
    @InjectRepository(Cliente) private readonly clientes: Repository<Cliente>,
    private readonly dataSource: DataSource,
  ) {}

  private validarFechaOError(fecha: Date): void {
    const error = validarFecha(fecha, new Date());
    if (error) {
      throw new BadRequestException(error);
    }
  }

  // La BD aporta los datos; la decisión la toman las funciones puras
  private async mesasLibresEn(manager: EntityManager, fecha: Date, personas: number) {
    const ventana = DURACION_RESERVA_MIN * 60_000;
    const mesas = await manager.find(Mesa);
    const existentes = await manager.find(Reserva, {
      where: {
        estado: ESTADO_RESERVA_ACTIVA,
        fechaReserva: Between(new Date(fecha.getTime() - ventana), new Date(fecha.getTime() + ventana)),
      },
      relations: { mesa: true },
    });
    return mesasLibres(
      mesas,
      existentes
        .filter((r) => r.mesa !== null)
        .map((r) => ({ mesaId: r.mesa!.idMesa, fecha: r.fechaReserva })),
      fecha,
      personas,
    );
  }

  private aDto(r: Reserva): ReservaDto {
    const estado =
      r.estado === ESTADO_RESERVA_ACTIVA
        ? 'ACTIVA'
        : r.estado === ESTADO_RESERVA_CANCELADA
          ? 'CANCELADA'
          : 'OTRO';
    return {
      idReserva: r.idReserva,
      fecha: r.fechaReserva.toISOString(),
      personas: r.cantidadPersona,
      estado,
      mesaId: r.mesa?.idMesa ?? null,
      mesaNumero: r.mesa?.numero ?? null,
    };
  }

  async mesasDisponibles(fecha: Date, personas: number): Promise<MesaDisponibleDto[]> {
    this.validarFechaOError(fecha);
    const libres = await this.mesasLibresEn(this.dataSource.manager, fecha, personas);
    return libres.map((m) => ({ idMesa: m.idMesa, numero: m.numero, capacidad: m.capacidad }));
  }

    // Todas las mesas activas, marcadas según su disponibilidad en esa fecha
  async plano(fecha: Date, personas: number): Promise<MesaPlanoDto[]> {
    this.validarFechaOError(fecha);
    const manager = this.dataSource.manager;
    const libres = await this.mesasLibresEn(manager, fecha, personas);
    const idsLibres = new Set(libres.map((m) => m.idMesa));
    const mesas = await manager.find(Mesa, {
      where: { estado: ESTADO_ACTIVO },
      order: { numero: 'ASC' },
    });
    return mesas.map(
      (m): MesaPlanoDto => ({
        idMesa: m.idMesa,
        numero: m.numero,
        capacidad: m.capacidad,
        estado: idsLibres.has(m.idMesa) ? 'LIBRE' : m.capacidad < personas ? 'PEQUENA' : 'OCUPADA',
      }),
    );
  }

  async crear(dto: CrearReservaDto): Promise<ReservaDto> {
    const fecha = new Date(dto.fecha);
    this.validarFechaOError(fecha);

    const idReserva = await this.dataSource.transaction(async (manager) => {
      // Evita que dos reservas simultáneas tomen la misma mesa
      await manager.query('LOCK TABLE reserva IN SHARE ROW EXCLUSIVE MODE');

      const cliente = await manager.findOne(Cliente, {
        where: { persona: { correo: dto.correo } },
      });
      if (!cliente) {
        throw new NotFoundException('No existe un cliente registrado con ese correo');
      }

      const libres = await this.mesasLibresEn(manager, fecha, dto.personas);
      const mesa =
        dto.mesaId === undefined ? libres[0] : libres.find((m) => m.idMesa === dto.mesaId);
      if (!mesa) {
        throw new ConflictException(
          dto.mesaId === undefined
            ? 'No hay mesas disponibles para esa fecha y cantidad de personas'
            : 'La mesa elegida no está disponible para esa fecha y cantidad de personas',
        );
      }

      const reserva = await manager.save(
        manager.create(Reserva, {
          fechaReserva: fecha,
          cantidadPersona: dto.personas,
          estado: ESTADO_RESERVA_ACTIVA,
          cliente,
          mesa,
        }),
      );
      return reserva.idReserva;
    });

    const guardada = await this.reservas.findOneOrFail({
      where: { idReserva },
      relations: { mesa: true },
    });
    return this.aDto(guardada);
  }

  async listarPorCorreo(correo: string): Promise<ReservaDto[]> {
    const cliente = await this.clientes.findOne({ where: { persona: { correo } } });
    if (!cliente) {
      throw new NotFoundException('No existe un cliente registrado con ese correo');
    }
    const lista = await this.reservas.find({
      where: { cliente: { idCliente: cliente.idCliente } },
      relations: { mesa: true },
      order: { fechaReserva: 'DESC' },
    });
    return lista.map((r) => this.aDto(r));
  }

  async cancelar(idReserva: number, correo: string): Promise<ReservaDto> {
    const reserva = await this.reservas.findOne({
      where: { idReserva, cliente: { persona: { correo } } },
      relations: { mesa: true },
    });
    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada para ese correo');
    }
    if (reserva.estado !== ESTADO_RESERVA_ACTIVA) {
      throw new ConflictException('La reserva ya no está activa');
    }
    if (!puedeCancelar(reserva.fechaReserva, new Date())) {
      throw new BadRequestException(
        `Solo se puede cancelar con al menos ${CANCELACION_MINIMA_MIN} minutos de antelación`,
      );
    }
    reserva.estado = ESTADO_RESERVA_CANCELADA;
    return this.aDto(await this.reservas.save(reserva));
  }
}