import { useState } from 'react';
import { Check, ClipboardCopy, Play } from 'lucide-react';
import type { RendimientoDto } from '@cafe-lenca/shared';
import { useRendimiento } from './paradigmas.api';

const aMarkdown = (r: RendimientoDto): string =>
  [
    `Medición en Node ${r.node} — ${new Date(r.fecha).toLocaleString('es-HN')}`,
    '',
    '| Paradigma | Prueba | Operaciones | Tiempo (ms) | ms por operación |',
    '|---|---|---:|---:|---:|',
    ...r.mediciones.map(
      (m) =>
        `| ${m.paradigma} | ${m.etiqueta} | ${m.operaciones.toLocaleString('es-HN')} | ${m.ms} | ${m.msPorOperacion} |`,
    ),
  ].join('\n');

export default function Rendimiento() {
  const medir = useRendimiento();
  const [copiado, setCopiado] = useState(false);
  const datos = medir.data;
  const maximo = datos ? Math.max(...datos.mediciones.map((m) => m.ms), 0.001) : 1;

  const copiar = async () => {
    if (!datos) return;
    try {
      await navigator.clipboard.writeText(aMarkdown(datos));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      /* el navegador no dio permiso al portapapeles */
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="font-display text-lg font-bold">Rendimiento de cada paradigma</h3>
        <p className="mt-1 text-sm text-muted">
          Se mide el código real del proyecto. Cada prueba descarta una ejecución de calentamiento y toma la
          mediana de 5 repeticiones.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={() => medir.mutate()}
            disabled={medir.isPending}
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg disabled:opacity-60"
          >
            <Play className="h-4 w-4" />
            {medir.isPending ? 'Midiendo… puede tardar unos segundos' : datos ? 'Medir de nuevo' : 'Ejecutar medición'}
          </button>
          {datos && (
            <button
              onClick={() => void copiar()}
              className="flex items-center gap-2 rounded-full border border-border bg-bg px-5 py-2.5 text-sm font-semibold"
            >
              {copiado ? <Check className="h-4 w-4 text-accent" /> : <ClipboardCopy className="h-4 w-4" />}
              {copiado ? 'Copiado' : 'Copiar tabla para el informe'}
            </button>
          )}
        </div>
        {medir.isError && <p className="mt-3 text-sm text-primary">{medir.error.message}</p>}
      </section>

      {datos && (
        <>
          <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="bg-surface-2 text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-4 py-3">Paradigma</th>
                  <th className="px-4 py-3">Prueba</th>
                  <th className="px-4 py-3 text-right">Operaciones</th>
                  <th className="px-4 py-3">Tiempo (ms)</th>
                  <th className="px-4 py-3 text-right">ms / operación</th>
                </tr>
              </thead>
              <tbody>
                {datos.mediciones.map((m) => (
                  <tr key={m.etiqueta} className="border-t border-border align-top">
                    <td className="px-4 py-3 font-semibold text-primary">{m.paradigma}</td>
                    <td className="px-4 py-3">
                      {m.etiqueta}
                      {m.nota && <span className="mt-0.5 block text-xs text-muted">{m.nota}</span>}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{m.operaciones.toLocaleString('es-HN')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-28 overflow-hidden rounded-full bg-surface-2">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${Math.max(2, (m.ms / maximo) * 100)}%` }}
                          />
                        </div>
                        <span className="tabular-nums">{m.ms}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{m.msPorOperacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted">
            Medido en Node {datos.node}. Las pruebas de Prolog y SQL incluyen costos fijos (crear la sesión del
            motor, la red hacia Supabase), así que no son comparables uno a uno con las sumas en memoria.
          </p>
        </>
      )}
    </div>
  );
}