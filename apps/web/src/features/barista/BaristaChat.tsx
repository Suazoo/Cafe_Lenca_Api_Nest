import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Check, Plus, Send, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { BaristaSugerenciaDto, MensajeBaristaDto } from '@cafe-lenca/shared';
import { ApiError } from '../../lib/api';
import { lempiras } from '../../lib/format';
import { useCarrito } from '../cart/cart.store';
import ProductImage from '../menu/ProductImage';
import { useBaristaDisponible, useConversarBarista } from './barista.api';

interface Burbuja {
  rol: 'cliente' | 'barista';
  texto: string;
  sugerencias?: BaristaSugerenciaDto[];
}

const SALUDO: Burbuja = {
  rol: 'barista',
  texto: '¡Hola! Soy tu barista virtual. Cuéntame qué se te antoja y te recomiendo algo del menú.',
};

const ATAJOS = ['Algo dulce', 'Una bebida fría', 'Algo económico', 'Para el desayuno'];

const mensajeDeError = (e: Error): string =>
  e instanceof ApiError && e.status === 429
    ? 'Vas muy rápido. Espera unos segundos e inténtalo de nuevo.'
    : e.message;

function Sugerencia({ s }: { s: BaristaSugerenciaDto }) {
  const agregar = useCarrito((st) => st.agregar);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    if (!agregado) return;
    const t = setTimeout(() => setAgregado(false), 1200);
    return () => clearTimeout(t);
  }, [agregado]);

  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-bg p-2">
      <ProductImage
        imagen={s.imagen}
        nombre={s.nombre}
        categoria={s.categoria}
        credito={false}
        className="h-20 w-24 shrink-0 rounded-xl"
      />
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <p className="truncate text-sm font-semibold">{s.nombre}</p>
          <p className="line-clamp-2 text-xs text-muted">{s.motivo}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-primary">{lempiras(s.precio)}</span>
          <button
            onClick={() => {
              agregar({ productoId: s.productoId, nombre: s.nombre, precio: s.precio });
              setAgregado(true);
            }}
            className={`flex h-8 items-center gap-1 rounded-full px-3 text-xs font-semibold transition-colors ${
              agregado ? 'bg-accent text-bg' : 'bg-primary text-primary-fg'
            }`}
          >
            {agregado ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {agregado ? 'Listo' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BaristaChat() {
  const estado = useBaristaDisponible();
  const conversar = useConversarBarista();
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState('');
  const [burbujas, setBurbujas] = useState<Burbuja[]>([SALUDO]);
  const final = useRef<HTMLDivElement>(null);

  useEffect(() => {
    final.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [burbujas, conversar.isPending, abierto]);

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false);
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [abierto]);

  // Si la IA no está configurada, el barista simplemente no aparece
  if (!estado.data?.disponible) return null;

  const enviar = (mensaje: string) => {
    const limpio = mensaje.trim();
    if (!limpio || conversar.isPending) return;
    const historial: MensajeBaristaDto[] = burbujas.slice(-6).map((b) => ({ rol: b.rol, texto: b.texto }));
    setBurbujas((b) => [...b, { rol: 'cliente', texto: limpio }]);
    setTexto('');
    conversar.mutate(
      { mensaje: limpio, historial },
      {
        onSuccess: (r) =>
          setBurbujas((b) => [...b, { rol: 'barista', texto: r.respuesta, sugerencias: r.sugerencias }]),
        onError: (e) => setBurbujas((b) => [...b, { rol: 'barista', texto: mensajeDeError(e) }]),
      },
    );
  };

  const alEnviar = (e: FormEvent) => {
    e.preventDefault();
    enviar(texto);
  };

  return (
    <>
      <AnimatePresence>
        {!abierto && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.08 }}
            onClick={() => setAbierto(true)}
            aria-label="Abrir el barista virtual"
            className="fixed bottom-20 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-fg shadow-xl shadow-primary/30 md:bottom-6 md:right-6"
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
            <Sparkles className="relative h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {abierto && (
          <motion.section
            role="dialog"
            aria-label="Barista virtual"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
            className="fixed inset-x-0 bottom-0 z-50 flex h-[78dvh] flex-col overflow-hidden rounded-t-3xl border border-border bg-surface shadow-2xl md:inset-x-auto md:bottom-6 md:right-6 md:h-[34rem] md:w-[24rem] md:rounded-3xl"
          >
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-fg">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-display text-base font-bold leading-tight">Barista IA</p>
                  <p className="text-[11px] text-muted">Te recomienda del menú de hoy</p>
                </div>
              </div>
              <button
                onClick={() => setAbierto(false)}
                aria-label="Cerrar"
                className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {burbujas.map((b, i) => (
                <div key={i} className={`flex flex-col gap-2 ${b.rol === 'cliente' ? 'items-end' : 'items-start'}`}>
                  <p
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${
                      b.rol === 'cliente'
                        ? 'rounded-br-md bg-primary text-primary-fg'
                        : 'rounded-bl-md bg-surface-2'
                    }`}
                  >
                    {b.texto}
                  </p>
                  {b.sugerencias && b.sugerencias.length > 0 && (
                    <div className="w-full space-y-2">
                      {b.sugerencias.map((s) => (
                        <Sugerencia key={s.productoId} s={s} />
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {conversar.isPending && (
                <div className="flex w-fit gap-1 rounded-2xl rounded-bl-md bg-surface-2 px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-2 w-2 rounded-full bg-muted"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              )}
              <div ref={final} />
            </div>

            <div className="border-t border-border px-4 pb-3 pt-2">
              {burbujas.length === 1 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {ATAJOS.map((a) => (
                    <button
                      key={a}
                      onClick={() => enviar(a)}
                      className="rounded-full border border-border bg-bg px-3 py-1 text-xs font-medium hover:border-primary"
                    >
                      {a}
                    </button>
                  ))}
                </div>
              )}
              <form onSubmit={alEnviar} className="flex gap-2">
                <input
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  maxLength={300}
                  placeholder="¿Qué se te antoja hoy?"
                  aria-label="Tu mensaje"
                  className="h-11 min-w-0 flex-1 rounded-full border border-border bg-bg px-4 text-sm outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={!texto.trim() || conversar.isPending}
                  aria-label="Enviar"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-fg disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <p className="mt-1.5 text-center text-[10px] text-muted">
                Respuestas generadas por IA. No compartas datos personales.
              </p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}