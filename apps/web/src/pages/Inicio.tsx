import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CalendarDays, ChevronRight, Receipt, UserRound, UtensilsCrossed } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { usePerfil } from '../features/cliente/cliente.api';
import { useCliente } from '../features/cliente/cliente.store';
import { useMasVendidos, useRecomendaciones } from '../features/inicio/inicio.api';
import RecomendacionCard from '../features/inicio/RecomendacionCard';
import { ApiError } from '../lib/api';

const ACCESOS: { to: string; titulo: string; detalle: string; Icono: LucideIcon }[] = [
  { to: '/menu', titulo: 'Menú', detalle: 'Todo lo que preparamos', Icono: UtensilsCrossed },
  { to: '/reservas', titulo: 'Reservar', detalle: 'Elige tu mesa', Icono: CalendarDays },
  { to: '/pedidos', titulo: 'Mis pedidos', detalle: 'Tus facturas y consumo', Icono: Receipt },
  { to: '/perfil', titulo: 'Mi perfil', detalle: 'Tus gustos y tu nivel', Icono: UserRound },
];

function Titulo({ children, a }: { children: ReactNode; a?: { to: string; texto: string } }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <h2 className="text-3xl font-bold">{children}</h2>
      {a && (
        <Link to={a.to} className="flex items-center text-sm font-semibold text-primary">
          {a.texto} <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export default function Inicio() {
  const correo = useCliente((s) => s.correo);
  const perfil = usePerfil(correo);
  const recs = useRecomendaciones(correo);
  const vendidos = useMasVendidos(5);

  const nombre = perfil.data?.nombreCompleto.split(' ')[0];
  const sinPerfil = !correo || (recs.error instanceof ApiError && recs.error.status === 404);

  return (
    <div className="space-y-14">
      {/* Portada */}
      <section className="patron-lenca relative overflow-hidden rounded-3xl border border-border bg-surface-2 px-6 py-16 text-center md:py-24">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-primary/25 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-accent/25 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            {nombre ? `Hola, ${nombre}` : 'Hecho en Honduras'}
          </p>
          <h1 className="mx-auto mt-3 max-w-2xl text-4xl font-bold leading-tight md:text-6xl">
            El café que sabe a <span className="text-primary">casa</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-muted">
            Pide desde tu mesa, reserva tu lugar y descubre lo que preparamos para ti.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/menu"
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-fg transition-transform hover:scale-105"
            >
              Ver el menú
            </Link>
            <Link
              to="/reservas"
              className="rounded-full border border-border bg-surface px-6 py-2.5 text-sm font-semibold transition-transform hover:scale-105"
            >
              Reservar mesa
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Sugerencias personalizadas */}
      <section>
        <Titulo>Para ti</Titulo>
        {sinPerfil ? (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-surface p-6">
            <div>
              <p className="text-lg font-bold">Descubre lo que va contigo</p>
              <p className="text-sm text-muted">
                Crea tu perfil y cuéntanos qué te gusta para recibir sugerencias hechas a tu medida.
              </p>
            </div>
            <Link
              to="/perfil"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg"
            >
              Crear mi perfil
            </Link>
          </div>
        ) : recs.isPending ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-60 w-64 shrink-0 animate-pulse rounded-3xl bg-surface-2" />
            ))}
          </div>
        ) : recs.isError ? (
          <p className="text-sm text-muted">No pudimos cargar tus sugerencias en este momento.</p>
        ) : recs.data.length === 0 ? (
          <p className="text-sm text-muted">Pronto tendremos nuevas sugerencias para ti.</p>
        ) : (
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none]">
            {recs.data.map((r, i) => (
              <RecomendacionCard key={r.productoId} item={r} indice={i} />
            ))}
          </div>
        )}
      </section>

      {/* Más vendidos */}
      {vendidos.data && vendidos.data.length > 0 && (
        <section>
          <Titulo a={{ to: '/menu', texto: 'Ver el menú' }}>Los más pedidos</Titulo>
          <ol className="grid gap-3 md:grid-cols-2">
            {vendidos.data.map((p, i) => (
              <li key={p.id}>
                <Link
                  to={`/menu?p=${p.id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary"
                >
                  <span className="w-10 font-display text-4xl font-bold text-primary/40 transition-colors group-hover:text-primary">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{p.nombre}</span>
                    <span className="block text-xs text-muted">{p.categoria ?? 'De la casa'}</span>
                  </span>
                  <span className="text-sm text-muted">{p.unidadesVendidas} vendidos</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Accesos rápidos */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {ACCESOS.map(({ to, titulo, detalle, Icono }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-3xl border border-border bg-surface p-5 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-lg hover:shadow-primary/10"
          >
            <Icono className="h-7 w-7 text-primary transition-transform group-hover:scale-110" strokeWidth={1.5} />
            <p className="mt-4 font-display text-lg font-bold">{titulo}</p>
            <p className="text-xs text-muted">{detalle}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}