import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { BaristaRespuestaDto } from '@cafe-lenca/shared';
import { GeminiCuotaError, GeminiService } from '../ai/gemini.service';
import { MenuService } from '../menu/menu.service';
import {
  INSTRUCCIONES_BARISTA,
  RESPUESTA_SIN_COINCIDENCIA,
  aCatalogo,
  armarPrompt,
  leerPropuesta,
  sanear,
  validarSugerencias,
} from './barista.rules';
import type { ConversarBaristaDto } from './dto/conversar-barista.dto';

@Injectable()
export class BaristaService {
  private readonly log = new Logger(BaristaService.name);
  private contador = { dia: '', usados: 0 };

  constructor(
    private readonly gemini: GeminiService,
    private readonly menu: MenuService,
    private readonly config: ConfigService,
  ) {}

  get disponible(): boolean {
    return this.gemini.disponible;
  }

  // Tope diario global para no agotar la cuota gratuita de la IA
  private reservarCupo(): void {
    const hoy = new Date().toISOString().slice(0, 10);
    if (this.contador.dia !== hoy) this.contador = { dia: hoy, usados: 0 };
    const limite = Number(this.config.get<string>('BARISTA_LIMITE_DIARIO') ?? 150);
    if (this.contador.usados >= limite) {
      throw new ServiceUnavailableException('El barista ya atendió a muchos clientes hoy. Vuelve mañana o explora el menú.');
    }
    this.contador.usados += 1;
  }

  async conversar(dto: ConversarBaristaDto): Promise<BaristaRespuestaDto> {
    if (!this.gemini.disponible) {
      throw new ServiceUnavailableException('El barista no está disponible en este momento.');
    }
    const mensaje = sanear(dto.mensaje, 300);
    if (!mensaje) throw new BadRequestException('Escribe un mensaje para el barista');
    this.reservarCupo();

    // La BD aporta el menú; la IA interpreta; las funciones puras validan
    const catalogo = aCatalogo(await this.menu.obtenerMenu({ orden: 'asc' }));
    if (catalogo.length === 0) {
      return { respuesta: 'Por ahora el menú está vacío. Vuelve en un momento.', sugerencias: [] };
    }

    let crudo: unknown;
    try {
      crudo = await this.gemini.generarJson({
        sistema: INSTRUCCIONES_BARISTA,
        partes: [{ texto: armarPrompt(catalogo, dto.historial ?? [], mensaje) }],
        temperatura: 0.4,
      });
    } catch (e) {
      if (e instanceof GeminiCuotaError) {
        throw new ServiceUnavailableException('El barista está descansando un momento. Inténtalo de nuevo en un minuto.');
      }
      this.log.warn(`El barista no pudo responder: ${e instanceof Error ? e.message : 'error'}`);
      throw new ServiceUnavailableException('El barista no pudo responder ahora. Inténtalo de nuevo.');
    }

    const propuesta = leerPropuesta(crudo);
    if (!propuesta) {
      return { respuesta: 'No te entendí bien. ¿Me lo cuentas de otra forma?', sugerencias: [] };
    }

    const sugerencias = validarSugerencias(propuesta, catalogo);
    // Si la IA propuso productos pero ninguno es válido, su texto ya no es confiable
    const respuesta =
      propuesta.productos.length > 0 && sugerencias.length === 0 ? RESPUESTA_SIN_COINCIDENCIA : propuesta.respuesta;
    return { respuesta, sugerencias };
  }
}