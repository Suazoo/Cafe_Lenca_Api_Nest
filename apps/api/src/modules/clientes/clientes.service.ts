import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import type { FindOptionsWhere } from 'typeorm';
import type { PerfilClienteDto } from '@cafe-lenca/shared';
import { Persona } from '../personas/persona.entity';
import { Telefono } from '../personas/telefono.entity';
import { ReglaDominioError } from '../personas/domain/persona.domain';
import { Cliente } from './cliente.entity';
import { ClienteDomain } from '../personas/domain/cliente.domain';
import type { AgregarPreferenciaDto } from './dto/agregar-preferencia.dto';
import type { RegistrarClienteDto } from './dto/registrar-cliente.dto';
import { PreferenciaCliente } from './preferencia-cliente.entity';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente) private readonly clientes: Repository<Cliente>,
    @InjectRepository(PreferenciaCliente) private readonly preferencias: Repository<PreferenciaCliente>,
    private readonly dataSource: DataSource,
  ) {}

  // Las reglas viven en las clases de dominio; aquí se traducen a HTTP 400
  private conDominio<T>(accion: () => T): T {
    try {
      return accion();
    } catch (e) {
      if (e instanceof ReglaDominioError) {
        throw new BadRequestException(e.message);
      }
      throw e;
    }
  }

  private async cargar(where: FindOptionsWhere<Cliente>): Promise<Cliente> {
    const cliente = await this.clientes.findOne({
      where,
      relations: { persona: { telefonos: true }, preferencias: true },
    });
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return cliente;
  }

  private aPerfil(cliente: Cliente): PerfilClienteDto {
    return this.conDominio(() => ClienteDomain.desdeEntidad(cliente).toDto());
  }

  async registrar(dto: RegistrarClienteDto): Promise<PerfilClienteDto> {
    // 1. El objeto de dominio valida las reglas antes de tocar la BD
    const dominio = this.conDominio(() => ClienteDomain.nuevo(dto));

    // 2. Persona + cliente + teléfono se guardan en una sola transacción
    const idCliente = await this.dataSource.transaction(async (manager) => {
      if (await manager.existsBy(Persona, { correo: dominio.correo })) {
        throw new ConflictException('Ya existe una persona registrada con ese correo');
      }

      const persona = await manager.save(
        manager.create(Persona, {
          pNombre: dominio.pNombre,
          sNombre: dominio.sNombre,
          pApellido: dominio.pApellido,
          sApellido: dominio.sApellido,
          correo: dominio.correo,
          fechaRegistro: new Date(),
        }),
      );
      const cliente = await manager.save(manager.create(Cliente, { persona }));

      if (dominio.telefonos.length > 0) {
        await manager.save(
          dominio.telefonos.map((numero) => manager.create(Telefono, { numero, persona })),
        );
      }
      return cliente.idCliente;
    });

    return this.aPerfil(await this.cargar({ idCliente }));
  }

  async perfilPorCorreo(correo: string): Promise<PerfilClienteDto> {
    return this.aPerfil(await this.cargar({ persona: { correo } }));
  }

  async agregarPreferencia(idCliente: number, dto: AgregarPreferenciaDto): Promise<PerfilClienteDto> {
    const cliente = await this.cargar({ idCliente });
    const dominio = this.conDominio(() => ClienteDomain.desdeEntidad(cliente));
    const nueva = this.conDominio(() => dominio.agregarPreferencia(dto.tipo, dto.valor));

    await this.preferencias.save(
      this.preferencias.create({ tipoPreferencia: nueva.tipo, valor: nueva.valor, cliente }),
    );
    return this.aPerfil(await this.cargar({ idCliente }));
  }
}