import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogicEngineService } from '../modules/logic/logic-engine.service';
import { Producto } from '../modules/menu/producto.entity';
import { ReportesService } from '../modules/reportes/reportes.service';
import { demoDeclarativo } from './declarativo.demo';
import { demoFuncional } from './funcional.demo';
import { demoImperativo } from './imperativo.demo';
import { demoLogico } from './logico.demo';
import type { EscenarioLogico } from './logico.demo';
import { demoOop } from './oop.demo';
import { demoRendimiento } from './rendimiento.demo';
import type { RendimientoDto } from '@cafe-lenca/shared';

// Solo orquesta: cada demostración vive en su propio archivo y usa el código real
@Injectable()
export class ParadigmsService {
  constructor(
    @InjectRepository(Producto) private readonly productos: Repository<Producto>,
    private readonly motor: LogicEngineService,
    private readonly reportes: ReportesService,
  ) {}

  imperativo() {
    return demoImperativo();
  }

  oop() {
    return demoOop();
  }

  async funcional() {
    return demoFuncional(await this.productos.find({ relations: { categoria: true } }));
  }

  logico(escenario: EscenarioLogico) {
    return demoLogico(this.motor, escenario);
  }

  declarativo() {
    return demoDeclarativo(this.reportes);
  }

  private medicionEnCurso: Promise<RendimientoDto> | null = null;

  // Si varias personas lanzan la medición a la vez, comparten una sola ejecución
  rendimiento(): Promise<RendimientoDto> {
    this.medicionEnCurso ??= demoRendimiento(this.motor, this.reportes).finally(() => {
      this.medicionEnCurso = null;
    });
    return this.medicionEnCurso;
  }
}