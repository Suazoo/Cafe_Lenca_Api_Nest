import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ESTADO_ACTIVO } from '../../common/constants/estado';
import { GeminiService } from '../ai/gemini.service';
import type { ParteGemini } from '../ai/gemini.service';
import { Producto } from '../menu/producto.entity';
import { ProductoImagen } from './producto-imagen.entity';
import { UnsplashService } from './unsplash.service';
import type { FotoCandidata } from './unsplash.service';

// El plan gratuito de Gemini permite unas 10 solicitudes por minuto
const PAUSA_IA_MS = 7_000;

interface EstadoSync {
  corriendo: boolean;
  total: number;
  hechos: number;
  actual: string | null;
  errores: { idProducto: number; nombre: string; mensaje: string }[];
  terminado: string | null;
}

const dormir = (ms: number) => new Promise<void>((ok) => setTimeout(ok, ms));
const esRegistro = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x);
const mensaje = (e: unknown): string => (e instanceof Error ? e.message : 'Error desconocido');

const descargar = async (url: string): Promise<{ mimeType: string; base64: string }> => {
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`No se pudo descargar la miniatura (${res.status})`);
  const mimeType = res.headers.get('content-type')?.split(';')[0] ?? 'image/jpeg';
  return { mimeType, base64: Buffer.from(await res.arrayBuffer()).toString('base64') };
};

@Injectable()
export class ImagenesService {
  private readonly log = new Logger(ImagenesService.name);
  private estadoSync: EstadoSync = {
    corriendo: false,
    total: 0,
    hechos: 0,
    actual: null,
    errores: [],
    terminado: null,
  };

  constructor(
    @InjectRepository(Producto) private readonly productos: Repository<Producto>,
    @InjectRepository(ProductoImagen) private readonly imagenes: Repository<ProductoImagen>,
    private readonly fotos: UnsplashService,
    private readonly gemini: GeminiService,
  ) {}

  async resumen() {
    const [productosActivos, conImagen] = await Promise.all([
      this.productos.count({ where: { estado: ESTADO_ACTIVO } }),
      this.imagenes.count(),
    ]);
    return {
      productosActivos,
      conImagen,
      iaConfigurada: this.gemini.disponible,
      fotosConfiguradas: this.fotos.disponible,
      sincronizacion: { ...this.estadoSync, errores: [...this.estadoSync.errores] },
    };
  }

  // Arranca el trabajo en segundo plano y responde de inmediato
  async sincronizar(opciones: { forzar: boolean; idProducto?: number; consulta?: string }) {
    if (this.estadoSync.corriendo) {
      throw new ConflictException('Ya hay una sincronización en curso');
    }

    const productos = await this.productos.find({
      where: opciones.idProducto !== undefined ? { idProducto: opciones.idProducto } : { estado: ESTADO_ACTIVO },
      relations: { categoria: true },
    });
    if (opciones.idProducto !== undefined && productos.length === 0) {
      throw new NotFoundException('Producto no encontrado');
    }

    const existentes = new Set(
      (await this.imagenes.find({ select: { idProducto: true } })).map((i) => i.idProducto),
    );
    const pendientes = productos.filter((p) => opciones.forzar || !existentes.has(p.idProducto));

    this.estadoSync = {
      corriendo: pendientes.length > 0,
      total: pendientes.length,
      hechos: 0,
      actual: null,
      errores: [],
      terminado: null,
    };
    if (pendientes.length > 0) {
      void this.procesar(pendientes, opciones.consulta?.trim() || undefined);
    }
    return { iniciado: pendientes.length > 0, pendientes: pendientes.length };
  }

  private async procesar(pendientes: Producto[], consultaManual?: string): Promise<void> {
    try {
      // Con una consulta manual no se pide nada a la IA para armarla
      const consultas = consultaManual ? new Map<number, string>() : await this.generarConsultas(pendientes);
      for (const p of pendientes) {
        this.estadoSync.actual = p.nombre;
        try {
          await this.procesarProducto(p, consultaManual ?? consultas.get(p.idProducto) ?? p.nombre);
        } catch (e) {
          this.log.warn(`Sin imagen para "${p.nombre}": ${mensaje(e)}`);
          this.estadoSync.errores.push({ idProducto: p.idProducto, nombre: p.nombre, mensaje: mensaje(e) });
        }
        this.estadoSync.hechos += 1;
      }
    } catch (e) {
      this.log.error(`La sincronización de imágenes falló: ${mensaje(e)}`);
    } finally {
      this.estadoSync.corriendo = false;
      this.estadoSync.actual = null;
      this.estadoSync.terminado = new Date().toISOString();
    }
  }

  // Una sola solicitud a la IA para todos los productos: nombres -> búsquedas en inglés
  private async generarConsultas(productos: Producto[]): Promise<Map<number, string>> {
    const mapa = new Map<number, string>();
    if (!this.gemini.disponible) return mapa;
    try {
      const lista = productos.map((p) => ({
        id: p.idProducto,
        nombre: p.nombre,
        descripcion: p.descripcion,
        categoria: p.categoria?.nombre ?? null,
      }));
      const respuesta = await this.gemini.generarJson({
        sistema: 'Eres un experto en fotografía gastronómica. Respondes únicamente con JSON válido.',
        partes: [
          {
            texto:
              'Para cada producto de una cafetería de Honduras escribe una consulta de búsqueda EN INGLÉS ' +
              '(2 a 5 palabras) para encontrar una buena foto de stock del producto ya servido. ' +
              'Evita personas y texto en la imagen. Devuelve un arreglo JSON: [{"id": número, "consulta": texto}].\n\n' +
              `Productos:\n${JSON.stringify(lista)}`,
          },
        ],
      });
      if (Array.isArray(respuesta)) {
        for (const x of respuesta as unknown[]) {
          if (esRegistro(x) && typeof x.id === 'number' && typeof x.consulta === 'string' && x.consulta.trim()) {
            mapa.set(x.id, x.consulta.trim().slice(0, 100));
          }
        }
      }
    } catch (e) {
      this.log.warn(`No se pudieron generar las consultas con IA: ${mensaje(e)}`);
    }
    return mapa;
  }

  private async procesarProducto(p: Producto, consulta: string): Promise<void> {
    let usada = consulta;
    let candidatas = await this.fotos.buscar(usada, 6);
    if (candidatas.length === 0) {
      usada = `${p.nombre} ${p.categoria?.nombre ?? ''}`.trim();
      candidatas = await this.fotos.buscar(usada, 6);
    }
    if (candidatas.length === 0) throw new Error('No se encontraron fotos para esa búsqueda');

    const elegida = await this.elegirConIa(p, candidatas);
    if (elegida === null) throw new Error('La IA descartó todas las fotos encontradas');

    await this.imagenes.save(
      this.imagenes.create({
        idProducto: p.idProducto,
        url: elegida.urlMedia,
        urlGrande: elegida.urlGrande,
        fotografo: elegida.fotografo.slice(0, 150),
        fotografoUrl: elegida.fotografoUrl,
        paginaUrl: elegida.paginaUrl,
        fuente: 'unsplash',
        consulta: usada.slice(0, 200),
      }),
    );
    // Solo cuando la foto quedó elegida y guardada se avisa a Unsplash
    await this.fotos.registrarDescarga(elegida);
  }

  // La IA mira las miniaturas y elige. Si falla, se usa la primera foto.
  private async elegirConIa(p: Producto, fotos: FotoCandidata[]): Promise<FotoCandidata | null> {
    if (!this.gemini.disponible || fotos.length === 1) return fotos[0];
    try {
      const partes: ParteGemini[] = [
        {
          texto:
            `Producto del menú: "${p.nombre}"${p.descripcion ? ` (${p.descripcion})` : ''}. ` +
            `Te muestro ${fotos.length} fotos numeradas del 1 al ${fotos.length}. Elige la que mejor ` +
            'representa ese producto servido, con buena composición y sin personas ni texto. ' +
            'Si ninguna sirve, responde 0. Responde solo JSON: {"elegida": número, "motivo": texto breve}.',
        },
      ];
      for (const [i, foto] of fotos.entries()) {
        partes.push({ texto: `Foto ${i + 1}:` }, { imagen: await descargar(foto.urlMiniatura) });
      }

      await dormir(PAUSA_IA_MS);
      const respuesta = await this.gemini.generarJson({ partes });
      const n = esRegistro(respuesta) && typeof respuesta.elegida === 'number' ? Math.round(respuesta.elegida) : 1;
      if (n === 0) return null;
      return fotos[n - 1] ?? fotos[0];
    } catch (e) {
      this.log.warn(`La IA no pudo elegir la foto de "${p.nombre}", se usa la primera: ${mensaje(e)}`);
      return fotos[0];
    }
  }
}