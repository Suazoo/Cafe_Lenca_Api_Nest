import type { ReactNode } from 'react';
import { Award, Coins, PiggyBank, Receipt, Tag } from 'lucide-react';
import { motion } from 'motion/react';
import type { EstadisticasClienteDto } from '@cafe-lenca/shared';
import { lempiras, mesCorto } from '../../lib/format';

function Dato({ icono, valor, etiqueta }: { icono: ReactNode; valor: string; etiqueta: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="text-primary">{icono}</div>
      <p className="mt-2 text-lg font-bold leading-tight">{valor}</p>
      <p className="text-xs text-muted">{etiqueta}</p>
    </div>
  );
}

export default function StatsPanel({ stats }: { stats: EstadisticasClienteDto }) {
  const meses = stats.gastoPorMes.slice(-6);
  const maximo = Math.max(1, ...meses.map((m) => m.total));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Dato icono={<Receipt className="h-5 w-5" />} valor={String(stats.totalPedidos)} etiqueta="Pedidos" />
        <Dato icono={<Coins className="h-5 w-5" />} valor={lempiras(stats.gastoTotal)} etiqueta="Total gastado" />
        <Dato icono={<Receipt className="h-5 w-5" />} valor={lempiras(stats.ticketPromedio)} etiqueta="Pedido promedio" />
        <Dato icono={<PiggyBank className="h-5 w-5" />} valor={lempiras(stats.ahorroTotal)} etiqueta="Has ahorrado" />
      </div>

      <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center gap-3">
          <Award className="h-5 w-5 shrink-0 text-gold" />
          <div className="min-w-0">
            <p className="text-xs text-muted">Tu producto favorito</p>
            <p className="truncate font-semibold">
              {stats.productoFavorito
                ? `${stats.productoFavorito.nombre} · ${stats.productoFavorito.unidades} ${stats.productoFavorito.unidades === 1 ? 'vez' : 'veces'}`
                : 'Aún no hay datos'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Tag className="h-5 w-5 shrink-0 text-accent" />
          <div className="min-w-0">
            <p className="text-xs text-muted">Tu categoría favorita</p>
            <p className="truncate font-semibold">{stats.categoriaFavorita?.nombre ?? 'Aún no hay datos'}</p>
          </div>
        </div>
      </div>

      {meses.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-4">
          <p className="text-sm font-semibold">Lo que has gastado por mes</p>
          <div className="mt-4 flex h-32 items-end gap-2">
            {meses.map((m) => (
              <div key={m.mes} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[10px] font-medium text-muted">{lempiras(m.total)}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(6, (m.total / maximo) * 78)}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="w-full rounded-t-lg bg-primary"
                />
                <span className="text-xs capitalize text-muted">{mesCorto(m.mes)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}