import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { motion } from 'motion/react';
import DemoView from './DemoView';
import { useLogico } from './paradigmas.api';
import type { Escenario } from './paradigmas.api';

const PRESETS: { etiqueta: string; valores: Escenario }[] = [
  { etiqueta: 'Cliente nuevo', valores: { pedidosMes: 0, pedidosTotal: 0, gasto: 0 } },
  { etiqueta: 'Cliente regular', valores: { pedidosMes: 2, pedidosTotal: 8, gasto: 600 } },
  { etiqueta: 'Frecuente', valores: { pedidosMes: 6, pedidosTotal: 20, gasto: 1200 } },
  { etiqueta: 'VIP', valores: { pedidosMes: 8, pedidosTotal: 40, gasto: 2500 } },
];

const DESLIZADORES: { clave: keyof Escenario; etiqueta: string; max: number; paso: number }[] = [
  { clave: 'pedidosMes', etiqueta: 'Pedidos en los últimos 30 días', max: 20, paso: 1 },
  { clave: 'pedidosTotal', etiqueta: 'Pedidos totales', max: 100, paso: 1 },
  { clave: 'gasto', etiqueta: 'Gasto acumulado (L)', max: 5000, paso: 50 },
];

interface Inferencia {
  nivel: string | null;
  descuentoPorcentaje: number | null;
}

export default function SimuladorProlog() {
  const [valores, setValores] = useState<Escenario>(PRESETS[1].valores);
  const [consulta, setConsulta] = useState<Escenario>(PRESETS[1].valores);

  // Espera 350 ms tras mover un control antes de consultar al motor
  useEffect(() => {
    const t = setTimeout(() => setConsulta(valores), 350);
    return () => clearTimeout(t);
  }, [valores]);

  const demo = useLogico(consulta);

  const inferencia = ((): Inferencia | null => {
    const bloque = demo.data?.bloques.find((b) => b.titulo.startsWith('Inferencia: nivel'));
    if (!bloque) return null;
    try {
      return JSON.parse(bloque.contenido) as Inferencia;
    } catch {
      return null;
    }
  })();

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-surface p-5">
        <h3 className="font-display text-lg font-bold">Simulador del motor Prolog</h3>
        <p className="mt-1 text-sm text-muted">
          Cambia los datos de un cliente de ejemplo y mira cómo Prolog infiere su nivel y su descuento.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.etiqueta}
              onClick={() => setValores(p.valores)}
              className="rounded-full border border-border bg-bg px-4 py-1.5 text-sm font-medium transition-colors hover:border-primary"
            >
              {p.etiqueta}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {DESLIZADORES.map((d) => (
            <label key={d.clave} className="block text-sm">
              <span className="flex justify-between gap-2">
                <span className="text-muted">{d.etiqueta}</span>
                <b>{valores[d.clave]}</b>
              </span>
              <input
                type="range"
                min={0}
                max={d.max}
                step={d.paso}
                value={valores[d.clave]}
                onChange={(e) => setValores((v) => ({ ...v, [d.clave]: Number(e.target.value) }))}
                className="mt-2 w-full accent-primary"
              />
            </label>
          ))}
        </div>

        {inferencia?.nivel && (
          <motion.p
            key={`${inferencia.nivel}-${inferencia.descuentoPorcentaje}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-fg"
          >
            <Zap className="h-4 w-4" />
            Nivel inferido: {inferencia.nivel} · {inferencia.descuentoPorcentaje} % de descuento
          </motion.p>
        )}
      </section>

      {demo.isPending ? (
        <div className="h-64 animate-pulse rounded-2xl bg-surface-2" />
      ) : demo.isError ? (
        <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-primary">
          {demo.error.message}
        </p>
      ) : (
        <div className={`transition-opacity ${demo.isFetching ? 'opacity-60' : ''}`}>
          <DemoView demo={demo.data} />
        </div>
      )}
    </div>
  );
}