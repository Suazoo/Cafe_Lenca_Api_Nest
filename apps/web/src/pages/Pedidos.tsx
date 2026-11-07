import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, ReceiptText } from 'lucide-react';
import type { PedidoHistorialDto } from '@cafe-lenca/shared';
import IdentificarCliente from '../features/cliente/IdentificarCliente';
import { useCliente } from '../features/cliente/cliente.store';
import { useEstadisticas, useHistorial } from '../features/pedidos/pedidos.api';
import StatsPanel from '../features/pedidos/StatsPanel';
import Ticket from '../features/pedidos/Ticket';
import { ApiError } from '../lib/api';
import { fechaHora, lempiras } from '../lib/format';

function PedidoItem({
  pedido,
  abierto,
  onAlternar,
}: {
  pedido: PedidoHistorialDto;
  abierto: boolean;
  onAlternar: () => void;
}) {
  return (
    <li className="relative">
      <span className="absolute -left-[31px] top-5 h-3 w-3 rounded-full bg-primary ring-4 ring-bg" />
      <div className="overflow-hidden rounded-3xl border border-border bg-surface">
        <button
          onClick={onAlternar}
          aria-expanded={abierto}
          className="flex w-full items-center justify-between gap-3 p-4 text-left"
        >
          <div>
            <p className="font-semibold capitalize">
              {pedido.fecha ? fechaHora(pedido.fecha) : `Pedido #${pedido.idPedido}`}
            </p>
            <p className="text-sm text-muted">
              {pedido.unidades} {pedido.unidades === 1 ? 'producto' : 'productos'}
              {pedido.numeroFactura ? ` · ${pedido.numeroFactura}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-primary">{lempiras(pedido.total)}</span>
            <ChevronDown className={`h-5 w-5 text-muted transition-transform ${abierto ? 'rotate-180' : ''}`} />
          </div>
        </button>

        <AnimatePresence initial={false}>
          {abierto && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="bg-surface-2 px-4 pb-6 pt-4">
                <Ticket pedido={pedido} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </li>
  );
}

export default function Pedidos() {
  const correo = useCliente((s) => s.correo);
  const historial = useHistorial(correo);
  const stats = useEstadisticas(correo);
  // undefined = ninguno elegido todavía (se abre el más reciente); null = todos cerrados
  const [abierto, setAbierto] = useState<number | null | undefined>(undefined);

  const encabezado = (
    <header className="mb-6">
      <h1 className="text-4xl font-bold md:text-5xl">Mis pedidos</h1>
      <p className="mt-1 text-sm text-muted">Todo lo que has pedido en Café Lenca.</p>
    </header>
  );

  if (!correo) {
    return (
      <div className="mx-auto max-w-xl">
        {encabezado}
        <div className="space-y-3 rounded-3xl border border-border bg-surface p-5">
          <p className="text-sm text-muted">Escribe tu correo para ver tu historial.</p>
          <IdentificarCliente />
          <p className="text-sm text-muted">
            ¿Aún no tienes cuenta?{' '}
            <Link to="/perfil" className="font-semibold text-primary underline">
              Créala aquí
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (historial.isPending) {
    return (
      <div>
        {encabezado}
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <div className="h-64 animate-pulse rounded-3xl bg-surface-2" />
          <div className="h-64 animate-pulse rounded-3xl bg-surface-2" />
        </div>
      </div>
    );
  }

  if (historial.isError) {
    const noEncontrado = historial.error instanceof ApiError && historial.error.status === 404;
    return (
      <div className="mx-auto max-w-xl">
        {encabezado}
        <div className="rounded-3xl border border-border bg-surface p-8 text-center">
          <p className="font-semibold">
            {noEncontrado ? 'No encontramos un cliente con ese correo' : 'No pudimos cargar tus pedidos'}
          </p>
          <p className="mt-1 text-sm text-muted">{historial.error.message}</p>
          {noEncontrado && (
            <Link to="/perfil" className="mt-4 inline-block font-semibold text-primary underline">
              Crear mi cuenta
            </Link>
          )}
        </div>
      </div>
    );
  }

  const lista = historial.data;
  if (lista.length === 0) {
    return (
      <div>
        {encabezado}
        <div className="grid place-items-center rounded-3xl border border-border bg-surface px-6 py-20 text-center">
          <ReceiptText className="h-12 w-12 text-muted" strokeWidth={1.25} />
          <p className="mt-3 text-lg font-semibold">Todavía no has hecho pedidos</p>
          <p className="text-sm text-muted">Cuando pidas algo, aparecerá aquí con su factura.</p>
          <Link
            to="/menu"
            className="mt-5 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-fg"
          >
            Ver el menú
          </Link>
        </div>
      </div>
    );
  }

  const visible = abierto === undefined ? lista[0].idPedido : abierto;

  return (
    <div>
      {encabezado}
      <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        <ol className="relative ml-2 space-y-4 border-l border-border pl-6">
          {lista.map((p) => (
            <PedidoItem
              key={p.idPedido}
              pedido={p}
              abierto={visible === p.idPedido}
              onAlternar={() => setAbierto(visible === p.idPedido ? null : p.idPedido)}
            />
          ))}
        </ol>

        <aside className="lg:sticky lg:top-24">
          {stats.data ? (
            <StatsPanel stats={stats.data} />
          ) : (
            <div className="h-64 animate-pulse rounded-3xl bg-surface-2" />
          )}
        </aside>
      </div>
    </div>
  );
}