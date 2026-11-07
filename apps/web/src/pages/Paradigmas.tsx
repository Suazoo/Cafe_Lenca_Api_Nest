import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import DemoView from '../features/paradigmas/DemoView';
import { useDemo } from '../features/paradigmas/paradigmas.api';
import type { IdDemo } from '../features/paradigmas/paradigmas.api';
import Rendimiento from '../features/paradigmas/Rendimiento';
import SimuladorProlog from '../features/paradigmas/SimuladorProlog';

const TABS = [
  { id: 'imperativo', etiqueta: 'Imperativo' },
  { id: 'oop', etiqueta: 'Orientado a objetos' },
  { id: 'funcional', etiqueta: 'Funcional' },
  { id: 'logico', etiqueta: 'Lógico (Prolog)' },
  { id: 'declarativo', etiqueta: 'Declarativo (SQL)' },
  { id: 'rendimiento', etiqueta: 'Rendimiento' },
] as const;

type IdTab = (typeof TABS)[number]['id'];

function DemoEstatica({ id }: { id: IdDemo }) {
  const demo = useDemo(id);

  if (demo.isPending) return <div className="h-72 animate-pulse rounded-2xl bg-surface-2" />;
  if (demo.isError) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="font-semibold">No pudimos cargar la demostración</p>
        <p className="mt-1 text-sm text-muted">{demo.error.message}</p>
        <button
          onClick={() => void demo.refetch()}
          className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-fg"
        >
          Reintentar
        </button>
      </div>
    );
  }
  return <DemoView demo={demo.data} />;
}

function Contenido({ id }: { id: IdTab }) {
  if (id === 'logico') return <SimuladorProlog />;
  if (id === 'rendimiento') return <Rendimiento />;
  return <DemoEstatica id={id} />;
}

export default function Paradigmas() {
  const [params, setParams] = useSearchParams();
  const pedida = params.get('t');
  const activo: IdTab = TABS.find((t) => t.id === pedida)?.id ?? 'imperativo';

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-4xl font-bold md:text-5xl">Detrás de escena</h1>
        <p className="mt-1 text-sm text-muted">
          Así funciona Café Lenca por dentro: cada paradigma de programación, con el código real en ejecución.
        </p>
      </header>

      <div role="tablist" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activo === t.id}
            onClick={() => setParams({ t: t.id }, { replace: true })}
            className={`relative shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              activo === t.id ? 'border-transparent text-primary-fg' : 'border-border bg-surface text-muted hover:text-text'
            }`}
          >
            {activo === t.id && (
              <motion.span
                layoutId="tab-paradigma"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{t.etiqueta}</span>
          </button>
        ))}
      </div>

      <motion.div
        key={activo}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-5"
      >
        <Contenido id={activo} />
      </motion.div>
    </div>
  );
}