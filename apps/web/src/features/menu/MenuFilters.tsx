import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowDownWideNarrow, ArrowUpNarrowWide, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { lempiras } from '../../lib/format';
import { FILTROS_INICIALES } from './menu.api';
import type { FiltrosMenu } from './menu.api';

interface Props {
  categorias: { id: number; nombre: string }[];
  techoPrecio: number;
  filtros: FiltrosMenu;
  onChange: (filtros: FiltrosMenu) => void;
}

function Chip({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`relative shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        activo ? 'border-transparent text-primary-fg' : 'border-border bg-surface text-muted hover:text-text'
      }`}
    >
      {activo && (
        <motion.span
          layoutId="chip-activo"
          className="absolute inset-0 rounded-full bg-primary"
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        />
      )}
      <span className="relative">{children}</span>
    </button>
  );
}

export default function MenuFilters({ categorias, techoPrecio, filtros, onChange }: Props) {
  // null = sin tope de precio
  const [limite, setLimite] = useState<number | null>(filtros.maxPrecio ?? null);
  const valor = limite ?? techoPrecio;

  // Espera 300 ms tras mover el control antes de consultar a la API
  useEffect(() => {
    const t = setTimeout(() => {
      const maxPrecio = limite === null || limite >= techoPrecio ? undefined : limite;
      if (maxPrecio !== filtros.maxPrecio) onChange({ ...filtros, maxPrecio });
    }, 300);
    return () => clearTimeout(t);
  }, [limite, techoPrecio, filtros, onChange]);

  const hayFiltros =
    filtros.categoriaId !== undefined || filtros.maxPrecio !== undefined || filtros.orden !== 'asc';

  return (
    <div className="sticky top-16 z-20 -mx-4 border-b border-border bg-bg/85 px-4 py-3 backdrop-blur">
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        <Chip activo={filtros.categoriaId === undefined} onClick={() => onChange({ ...filtros, categoriaId: undefined })}>
          Todo
        </Chip>
        {categorias.map((c) => (
          <Chip
            key={c.id}
            activo={filtros.categoriaId === c.id}
            onClick={() => onChange({ ...filtros, categoriaId: c.id })}
          >
            {c.nombre}
          </Chip>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2">
        {techoPrecio > 0 && (
          <label className="flex items-center gap-3 text-sm">
            <span className="text-muted">Hasta</span>
            <input
              type="range"
              min={0}
              max={techoPrecio}
              step={1}
              value={valor}
              onChange={(e) => setLimite(Number(e.target.value))}
              className="w-40 accent-primary"
            />
            <span className="w-20 font-semibold">{limite === null ? 'Sin tope' : lempiras(valor)}</span>
          </label>
        )}

        <button
          onClick={() => onChange({ ...filtros, orden: filtros.orden === 'asc' ? 'desc' : 'asc' })}
          className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-text"
        >
          {filtros.orden === 'asc' ? (
            <ArrowUpNarrowWide className="h-4 w-4" />
          ) : (
            <ArrowDownWideNarrow className="h-4 w-4" />
          )}
          Precio {filtros.orden === 'asc' ? 'menor a mayor' : 'mayor a menor'}
        </button>

        {hayFiltros && (
          <button
            onClick={() => {
              setLimite(null);
              onChange(FILTROS_INICIALES);
            }}
            className="flex items-center gap-1.5 text-sm font-medium text-primary"
          >
            <RotateCcw className="h-4 w-4" /> Limpiar
          </button>
        )}
      </div>
    </div>
  );
}