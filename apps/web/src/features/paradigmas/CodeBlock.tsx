import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { DemoBloque } from '@cafe-lenca/shared';

const ETIQUETA: Record<DemoBloque['lenguaje'], string> = {
  json: 'JSON',
  sql: 'SQL',
  prolog: 'Prolog',
  texto: 'Texto',
};

const esComentario = (linea: string): boolean => /^\s*(%|--)/.test(linea);

export default function CodeBlock({ bloque }: { bloque: DemoBloque }) {
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(bloque.contenido);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      /* el navegador no dio permiso al portapapeles */
    }
  };

  return (
    <figure className="overflow-hidden rounded-2xl border border-border bg-surface">
      <figcaption className="flex items-center justify-between gap-3 border-b border-border bg-surface-2 px-4 py-2">
        <span className="min-w-0 truncate text-sm font-semibold">{bloque.titulo}</span>
        <span className="flex shrink-0 items-center gap-3">
          <span className="rounded bg-bg px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
            {ETIQUETA[bloque.lenguaje]}
          </span>
          <button onClick={() => void copiar()} aria-label="Copiar" className="text-muted hover:text-text">
            {copiado ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
          </button>
        </span>
      </figcaption>
      <pre className="max-h-96 overflow-auto p-4 font-mono text-[12.5px] leading-relaxed">
        <code>
          {bloque.contenido.split('\n').map((linea, i) => (
            <span
              key={i}
              className={bloque.lenguaje !== 'json' && esComentario(linea) ? 'text-muted' : undefined}
            >
              {linea}
              {'\n'}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}