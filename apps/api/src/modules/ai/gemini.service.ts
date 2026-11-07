import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type ParteGemini =
  | { texto: string }
  | { imagen: { mimeType: string; base64: string } };

export interface PeticionGemini {
  sistema?: string;
  partes: ParteGemini[];
  json?: boolean;
  temperatura?: number;
  maxTokens?: number;
}

export class GeminiError extends Error {}
export class GeminiCuotaError extends GeminiError {}

interface RespuestaGemini {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

const MODELO_POR_DEFECTO = 'gemini-3.5-flash-lite';

// Cliente mínimo de la API REST de Gemini. La clave solo vive en el servidor.
@Injectable()
export class GeminiService {
  private readonly log = new Logger(GeminiService.name);

  constructor(private readonly config: ConfigService) {}

  get disponible(): boolean {
    return !!this.config.get<string>('GEMINI_API_KEY');
  }

  async generar(p: PeticionGemini): Promise<string> {
    const clave = this.config.get<string>('GEMINI_API_KEY');
    if (!clave) throw new GeminiError('La IA no está configurada');
    const modelo = this.config.get<string>('GEMINI_MODEL') ?? MODELO_POR_DEFECTO;

    const cuerpo = {
      ...(p.sistema ? { systemInstruction: { parts: [{ text: p.sistema }] } } : {}),
      contents: [
        {
          role: 'user',
          parts: p.partes.map((parte) =>
            'texto' in parte
              ? { text: parte.texto }
              : { inlineData: { mimeType: parte.imagen.mimeType, data: parte.imagen.base64 } },
          ),
        },
      ],
      generationConfig: {
        temperature: p.temperatura ?? 0.2,
        // Los modelos con razonamiento cuentan sus "pensamientos" dentro de este tope
        maxOutputTokens: p.maxTokens ?? 2048,
        ...(p.json ? { responseMimeType: 'application/json' } : {}),
      },
    };

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelo)}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': clave },
        body: JSON.stringify(cuerpo),
        signal: AbortSignal.timeout(30_000),
      },
    );

    if (res.status === 429) {
      throw new GeminiCuotaError('Se alcanzó el límite de uso de la IA. Intenta de nuevo en un momento.');
    }
    if (!res.ok) {
      this.log.warn(`Gemini respondió ${res.status} con el modelo ${modelo}`);
      throw new GeminiError(`Gemini respondió ${res.status}`);
    }

    const datos = (await res.json()) as RespuestaGemini;
    const texto = datos.candidates?.[0]?.content?.parts?.map((x) => x.text ?? '').join('') ?? '';
    if (!texto.trim()) throw new GeminiError('Gemini no devolvió texto');
    return texto;
  }

  // Pide JSON y lo convierte; el que llama valida la forma del resultado
  async generarJson(p: Omit<PeticionGemini, 'json'>): Promise<unknown> {
    const texto = await this.generar({ ...p, json: true });
    const limpio = texto
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '');
    try {
      return JSON.parse(limpio) as unknown;
    } catch {
      throw new GeminiError('La IA devolvió una respuesta que no es JSON válido');
    }
  }
}