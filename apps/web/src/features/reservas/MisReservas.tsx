import { CalendarX2 } from 'lucide-react';
import { ApiError } from '../../lib/api';
import { fechaHora } from '../../lib/format';
import { useCliente } from '../cliente/cliente.store';
import { useCancelarReserva, useMisReservas } from './reservas.api';

export default function MisReservas() {
  const correo = useCliente((s) => s.correo);
  const lista = useMisReservas(correo);
  const cancelar = useCancelarReserva();

  if (!correo) return null;
  // Si el correo no pertenece a un cliente, el aviso ya se muestra en el formulario
  if (lista.error instanceof ApiError && lista.error.status === 404) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-4 text-2xl font-bold">Mis reservas</h2>

      {lista.isPending ? (
        <div className="h-20 animate-pulse rounded-2xl bg-surface-2" />
      ) : lista.isError ? (
        <p className="text-sm text-primary">{lista.error.message}</p>
      ) : lista.data.length === 0 ? (
        <div className="grid place-items-center rounded-3xl border border-border bg-surface px-6 py-10 text-center">
          <CalendarX2 className="h-8 w-8 text-muted" strokeWidth={1.25} />
          <p className="mt-2 text-sm text-muted">Todavía no tienes reservas.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {lista.data.map((r) => {
            const activa = r.estado === 'ACTIVA';
            const cancelando = cancelar.isPending && cancelar.variables?.idReserva === r.idReserva;
            return (
              <li
                key={r.idReserva}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4"
              >
                <div>
                  <p className="font-semibold capitalize">{fechaHora(r.fecha)}</p>
                  <p className="text-sm text-muted">
                    {r.personas} {r.personas === 1 ? 'persona' : 'personas'}
                    {r.mesaNumero !== null ? ` · Mesa ${r.mesaNumero}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      activa ? 'bg-accent/15 text-accent' : 'bg-border text-muted'
                    }`}
                  >
                    {activa ? 'Confirmada' : 'Cancelada'}
                  </span>
                  {activa && (
                    <button
                      disabled={cancelando}
                      onClick={() => cancelar.mutate({ idReserva: r.idReserva, correo })}
                      className="text-sm font-medium text-primary disabled:opacity-40"
                    >
                      {cancelando ? 'Cancelando…' : 'Cancelar'}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {cancelar.isError && <p className="mt-3 text-sm text-primary">{cancelar.error.message}</p>}
    </section>
  );
}