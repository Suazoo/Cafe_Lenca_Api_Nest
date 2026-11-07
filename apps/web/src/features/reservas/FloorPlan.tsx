import { Coffee } from 'lucide-react';
import { motion } from 'motion/react';
import type { MesaPlanoDto } from '@cafe-lenca/shared';

interface Props {
  mesas: MesaPlanoDto[];
  seleccionadaId: number | null;
  onElegir: (idMesa: number) => void;
}

const ETIQUETA: Record<MesaPlanoDto['estado'], string> = {
  LIBRE: 'libre',
  OCUPADA: 'ocupada',
  PEQUENA: 'no alcanza para tu grupo',
};

function Mesa({
  mesa,
  seleccionada,
  onElegir,
}: {
  mesa: MesaPlanoDto;
  seleccionada: boolean;
  onElegir: () => void;
}) {
  const libre = mesa.estado === 'LIBRE';
  const diametro = Math.min(52 + mesa.capacidad * 5, 96);
  const radioSillas = diametro / 2 + 9;
  const sillas = Math.min(mesa.capacidad, 10);

  const colorSilla = seleccionada ? 'bg-primary' : libre ? 'bg-accent/50' : 'bg-border';
  const colorMesa = seleccionada
    ? 'border-primary bg-primary text-primary-fg shadow-lg shadow-primary/30'
    : libre
      ? 'border-accent bg-surface text-text hover:bg-accent/10'
      : mesa.estado === 'OCUPADA'
        ? 'border-border bg-border/60 text-muted'
        : 'border-dashed border-border bg-transparent text-muted';

  return (
    <div className="relative grid place-items-center" style={{ height: diametro + 44 }}>
      {Array.from({ length: sillas }, (_, i) => (
        <span
          key={i}
          className={`absolute h-3.5 w-3.5 rounded-full transition-colors ${colorSilla}`}
          style={{
            left: '50%',
            top: '50%',
            margin: -7,
            transform: `rotate(${(360 / sillas) * i}deg) translateY(-${radioSillas}px)`,
          }}
        />
      ))}

      <motion.button
        type="button"
        disabled={!libre}
        aria-pressed={seleccionada}
        aria-label={`Mesa ${mesa.numero}, ${mesa.capacidad} personas, ${ETIQUETA[mesa.estado]}`}
        onClick={onElegir}
        whileHover={libre ? { scale: 1.06 } : undefined}
        whileTap={libre ? { scale: 0.95 } : undefined}
        className={`relative z-10 flex flex-col items-center justify-center rounded-full border-2 transition-colors disabled:cursor-not-allowed ${colorMesa}`}
        style={{ width: diametro, height: diametro }}
      >
        <span className="font-display text-xl font-bold leading-none">{mesa.numero}</span>
        <span className="mt-0.5 text-[10px] font-medium">{mesa.capacidad} pers.</span>
      </motion.button>
    </div>
  );
}

function Leyenda({ clase, texto }: { clase: string; texto: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-full border-2 ${clase}`} />
      {texto}
    </span>
  );
}

export default function FloorPlan({ mesas, seleccionadaId, onElegir }: Props) {
  return (
    <div className="patron-lenca rounded-3xl border border-border bg-surface-2 p-4 md:p-6">
      <div className="mx-auto flex max-w-xs items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-2 text-xs font-medium uppercase tracking-widest text-muted">
        <Coffee className="h-4 w-4" /> Barra de café
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-2 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
        {mesas.map((m) => (
          <Mesa
            key={m.idMesa}
            mesa={m}
            seleccionada={m.idMesa === seleccionadaId}
            onElegir={() => onElegir(m.idMesa)}
          />
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3 text-[11px] uppercase tracking-widest text-muted">
        <span className="h-px flex-1 border-t border-dashed border-border" />
        Entrada
        <span className="h-px flex-1 border-t border-dashed border-border" />
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-muted">
        <Leyenda clase="border-accent bg-surface" texto="Libre" />
        <Leyenda clase="border-primary bg-primary" texto="Tu mesa" />
        <Leyenda clase="border-border bg-border/60" texto="Ocupada" />
        <Leyenda clase="border-dashed border-border" texto="Muy pequeña" />
      </div>
    </div>
  );
}