import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Minus, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import type { ReservaDto } from '@cafe-lenca/shared';
import IdentificarCliente from '../features/cliente/IdentificarCliente';
import { useCliente } from '../features/cliente/cliente.store';
import FloorPlan from '../features/reservas/FloorPlan';
import MisReservas from '../features/reservas/MisReservas';
import { useCrearReserva, usePlano } from '../features/reservas/reservas.api';
import {
  DIAS_MAX,
  aFechaLocal,
  combinar,
  fechaInicial,
  franjaValida,
  franjas,
} from '../features/reservas/slots';
import { ApiError } from '../lib/api';
import { fechaHora } from '../lib/format';

const HORAS = franjas();
const MAX_PERSONAS = 20;

export default function Reservas() {
  const correo = useCliente((s) => s.correo);
  const [fecha, setFecha] = useState(fechaInicial);
  const [hora, setHora] = useState<string | null>(null);
  const [personas, setPersonas] = useState(2);
  const [mesaId, setMesaId] = useState<number | null>(null);
  const [exito, setExito] = useState<ReservaDto | null>(null);

  const fechaIso =
    hora !== null && franjaValida(fecha, hora) ? combinar(fecha, hora).toISOString() : null;
  const plano = usePlano(fechaIso, personas);
  const crear = useCrearReserva();

  // Si la mesa elegida deja de estar libre, la selección se descarta sola
  const mesaElegida = plano.data?.find((m) => m.idMesa === mesaId && m.estado === 'LIBRE') ?? null;
  const libres = plano.data?.filter((m) => m.estado === 'LIBRE').length ?? 0;
  const puedeReservar = !!correo && fechaIso !== null && plano.isSuccess && libres > 0 && !crear.isPending;

  const limpiar = () => {
    setMesaId(null);
    setExito(null);
    crear.reset();
  };

  const cambiarFecha = (nueva: string) => {
    setFecha(nueva);
    if (hora !== null && !franjaValida(nueva, hora)) setHora(null);
    limpiar();
  };

  const cambiarPersonas = (n: number) => {
    setPersonas(Math.min(MAX_PERSONAS, Math.max(1, n)));
    limpiar();
  };

  const reservar = () => {
    if (!correo || fechaIso === null) return;
    crear.mutate(
      { correo, fecha: fechaIso, personas, mesaId: mesaElegida?.idMesa },
      {
        onSuccess: (reserva) => {
          setExito(reserva);
          setMesaId(null);
        },
      },
    );
  };

  const hoy = new Date();
  const clienteNoExiste = crear.error instanceof ApiError && crear.error.status === 404;

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-4xl font-bold md:text-5xl">Reserva tu mesa</h1>
        <p className="mt-1 text-sm text-muted">Elige cuándo vienes y toca la mesa que más te guste.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        {/* Columna izquierda: cuándo y confirmación */}
        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="space-y-4 rounded-3xl border border-border bg-surface p-5">
            <label className="block text-sm font-medium">
              Día
              <input
                type="date"
                value={fecha}
                min={aFechaLocal(hoy)}
                max={aFechaLocal(new Date(hoy.getTime() + DIAS_MAX * 86_400_000))}
                onChange={(e) => e.target.value && cambiarFecha(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-2xl border border-border bg-bg px-3 outline-none focus:border-primary"
              />
            </label>

            <div>
              <p className="text-sm font-medium">Personas</p>
              <div className="mt-1.5 flex w-fit items-center gap-3 rounded-full border border-border bg-bg p-1">
                <button
                  aria-label="Una persona menos"
                  onClick={() => cambiarPersonas(personas - 1)}
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-surface-2"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-bold">{personas}</span>
                <button
                  aria-label="Una persona más"
                  onClick={() => cambiarPersonas(personas + 1)}
                  className="grid h-9 w-9 place-items-center rounded-full hover:bg-surface-2"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium">Hora</p>
              <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                {HORAS.map((h) => {
                  const valida = franjaValida(fecha, h);
                  const activa = hora === h;
                  return (
                    <button
                      key={h}
                      disabled={!valida}
                      onClick={() => {
                        setHora(h);
                        limpiar();
                      }}
                      className={`rounded-xl border py-1.5 text-xs font-semibold transition-colors ${
                        activa
                          ? 'border-transparent bg-primary text-primary-fg'
                          : 'border-border bg-bg hover:border-primary disabled:opacity-30 disabled:hover:border-border'
                      }`}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="space-y-3 rounded-3xl border border-border bg-surface p-5">
            {exito ? (
              <div className="space-y-3 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent text-bg"
                >
                  <CalendarCheck className="h-7 w-7" />
                </motion.div>
                <h2 className="text-2xl font-bold">¡Reserva confirmada!</h2>
                <p className="text-sm capitalize text-muted">{fechaHora(exito.fecha)}</p>
                <p className="text-sm">
                  Mesa <b>{exito.mesaNumero}</b> · {exito.personas}{' '}
                  {exito.personas === 1 ? 'persona' : 'personas'}
                </p>
                <button onClick={limpiar} className="text-sm font-semibold text-primary">
                  Hacer otra reserva
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-display text-lg font-bold">Tu reserva</h2>
                <p className="text-sm text-muted">
                  {fechaIso === null
                    ? 'Elige una hora para ver las mesas.'
                    : mesaElegida
                      ? `Mesa ${mesaElegida.numero} · ${personas} ${personas === 1 ? 'persona' : 'personas'}`
                      : 'Toca una mesa libre o deja que elijamos la mejor por ti.'}
                </p>

                <IdentificarCliente />

                {crear.isError && (
                  <p className="text-sm text-primary">
                    {crear.error.message}
                    {clienteNoExiste && (
                      <>
                        {' '}
                        <Link to="/perfil" className="font-semibold underline">
                          Regístrate aquí
                        </Link>
                      </>
                    )}
                  </p>
                )}

                <button
                  disabled={!puedeReservar}
                  onClick={reservar}
                  className="h-12 w-full rounded-full bg-primary font-semibold text-primary-fg transition-opacity disabled:opacity-40"
                >
                  {crear.isPending
                    ? 'Reservando…'
                    : mesaElegida
                      ? `Reservar mesa ${mesaElegida.numero}`
                      : 'Reservar la mejor mesa'}
                </button>
                {!correo && <p className="text-center text-xs text-muted">Indica tu correo para reservar</p>}
              </>
            )}
          </section>
        </div>

        {/* Columna derecha: el salón */}
        <div>
          {fechaIso === null ? (
            <div className="patron-lenca grid min-h-80 place-items-center rounded-3xl border border-border bg-surface-2 p-8 text-center">
              <div>
                <p className="font-display text-2xl font-bold">El salón te espera</p>
                <p className="mt-1 text-sm text-muted">Elige día, personas y hora para ver las mesas disponibles.</p>
              </div>
            </div>
          ) : plano.isPending ? (
            <div className="h-96 animate-pulse rounded-3xl bg-surface-2" />
          ) : plano.isError ? (
            <div className="rounded-3xl border border-border bg-surface p-10 text-center">
              <p className="font-semibold">No pudimos cargar el salón</p>
              <p className="mt-1 text-sm text-muted">{plano.error.message}</p>
            </div>
          ) : (
            <>
              <FloorPlan mesas={plano.data} seleccionadaId={mesaElegida?.idMesa ?? null} onElegir={setMesaId} />
              {libres === 0 && (
                <p className="mt-3 text-center text-sm text-primary">
                  No quedan mesas para ese horario y grupo. Prueba con otra hora.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <MisReservas />
    </div>
  );
}