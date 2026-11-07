import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface FotoCandidata {
  id: string;
  urlMiniatura: string;
  urlMedia: string;
  urlGrande: string;
  fotografo: string;
  fotografoUrl: string;
  paginaUrl: string;
  descargaUrl: string;
}

interface UnsplashPhoto {
  id: string;
  urls: { regular: string; full: string; small: string };
  links: { html: string; download_location: string };
  user: { name: string; links: { html: string } };
}

// Las guías de Unsplash piden que los enlaces de crédito lleven estos parámetros
const UTM = 'utm_source=cafe_lenca&utm_medium=referral';
const conUtm = (url: string): string => `${url}${url.includes('?') ? '&' : '?'}${UTM}`;

@Injectable()
export class UnsplashService {
  private readonly log = new Logger(UnsplashService.name);

  constructor(private readonly config: ConfigService) {}

  get disponible(): boolean {
    return !!this.config.get<string>('UNSPLASH_ACCESS_KEY');
  }

  private cabeceras(): Record<string, string> {
    const clave = this.config.get<string>('UNSPLASH_ACCESS_KEY');
    if (!clave) throw new Error('Falta UNSPLASH_ACCESS_KEY en el archivo .env');
    return { Authorization: `Client-ID ${clave}`, 'Accept-Version': 'v1' };
  }

  async buscar(consulta: string, cantidad = 6): Promise<FotoCandidata[]> {
    const url = new URL('https://api.unsplash.com/search/photos');
    url.searchParams.set('query', consulta);
    url.searchParams.set('per_page', String(cantidad));
    url.searchParams.set('orientation', 'landscape');
    url.searchParams.set('content_filter', 'high');

    const res = await fetch(url, { headers: this.cabeceras(), signal: AbortSignal.timeout(15_000) });
    if (res.status === 401) throw new Error('UNSPLASH_ACCESS_KEY no es válida');
    if (res.status === 403 || res.status === 429) {
      throw new Error('Se alcanzó el límite de Unsplash (50 solicitudes por hora en modo demo)');
    }
    if (!res.ok) throw new Error(`Unsplash respondió ${res.status}`);

    const datos = (await res.json()) as { results?: UnsplashPhoto[] };
    return (datos.results ?? []).map((f) => ({
      id: f.id,
      urlMiniatura: f.urls.small,
      urlMedia: f.urls.regular,
      urlGrande: f.urls.full,
      fotografo: f.user.name,
      fotografoUrl: conUtm(f.user.links.html),
      paginaUrl: conUtm(f.links.html),
      descargaUrl: f.links.download_location,
    }));
  }

  // Requisito de Unsplash: avisar cuando una foto se usa de verdad
  async registrarDescarga(foto: FotoCandidata): Promise<void> {
    try {
      await fetch(foto.descargaUrl, { headers: this.cabeceras(), signal: AbortSignal.timeout(10_000) });
    } catch (e) {
      this.log.warn(`No se pudo registrar el uso de la foto ${foto.id}: ${e instanceof Error ? e.message : 'error'}`);
    }
  }
}