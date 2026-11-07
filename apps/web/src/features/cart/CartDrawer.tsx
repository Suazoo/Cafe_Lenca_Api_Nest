import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { BadgePercent, Check, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import type { CrearPedidoRespuestaDto } from '@cafe-lenca/shared';
import AnimatedPrice from '../../components/ui/AnimatedPrice';
import { ApiError } from '../../lib/api';
import { lempiras } from '../../lib/format';
import { useCliente } from '../cliente/cliente.store';
import { useCalculo, useCrearPedido, useDescuento, useMetodosPago } from './cart.api';
import { useCarrito } from './cart.store';

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  abierto: boolean;
  onCerrar: () => void;
}

export default function CartDrawer({ abierto, onCerrar }: Props) {
  const items = useCarrito((s) => s.items);
  const cambiarCantidad = useCarrito((s) => s.cambiarCantidad);
  const quitar = useCarrito((s) => s.quitar);
  const vaciar = useCarrito((s) => s.vaciar);
  const correo = useCliente((s) => s.correo);
  const setCorreo = useCliente((s) => s.setCorreo);
  const olvidar = useCliente((s) => s.olvidar);

  const [borrador, setBorrador] = useState('');
  const [metodoId, setMetodoId] = useState<number | null>(null);
  const [confirmado, setConfirmado] = useState<CrearPedidoRespuestaDto | null>(null);

  const descuento = useDescuento(correo, abierto);
  const porcentaje = descuento.data?.descuentoPorcentaje ?? 0;
  const calculo = useCalculo(items, porcentaje, abierto);
  const metodos = useMetodosPago(abierto);
  const crear = useCrearPedido();

  // Si el cliente no ha elegido, se usa el primer método de pago
  const metodoElegido = metodoId ?? metodos.data?.[0]?.id ?? null;
  const correoValido = REGEX_CORREO.test(borrador.trim());
  const puedeConfirmar =
    items.length > 0 &&
    !!correo &&
    descuento.isSuccess &&
    calculo.isSuccess &&
    metodoElegido !== null &&
    !crear.isPending;

  const cerrar = () => {
    setConfirmado(null);
    crear.reset();
    onCerrar();
  };

  // Escape cierra el panel y se bloquea el scroll de la página mientras está abierto
  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setConfirmado(null);
        onCerrar();
      }
    };
    window.addEventListener('keydown', alTeclear);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = '';
    };
  }, [abierto, onCerrar]);

  const confirmar = () => {
    if (!correo || metodoElegido === null) return;
    crear.mutate(
      { correo, items, metodoPagoId: metodoElegido },
      {
        onSuccess: (respuesta) => {
          setConfirmado(respuesta);
          vaciar();
        },
      },
    );
  };

  const clienteNoExiste = descuento.error instanceof ApiError && descuento.error.status === 404;

  return (
    <AnimatePresence>
      {abierto && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={cerrar}
        >
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Tu pedido"
            className="absolute right-0 top-0 flex h-dvh w-full max-w-md flex-col border-l border-border bg-surface shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-2xl font-bold">{confirmado ? 'Pedido listo' : 'Tu pedido'}</h2>
              <button
                onClick={cerrar}
                aria-label="Cerrar"
                className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-text"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {confirmado ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className="grid h-20 w-20 place-items-center rounded-full bg-accent text-bg"
                >
                  <Check className="h-10 w-10" strokeWidth={3} />
                </motion.div>
                <h3 className="text-3xl font-bold">¡Pedido confirmado!</h3>
                <p className="text-sm text-muted">Factura {confirmado.numeroFactura}</p>
                <p className="text-3xl font-bold text-primary">{lempiras(confirmado.factura.total)}</p>
                <p className="text-sm">
                  Nivel <b>{confirmado.nivelCliente}</b>
                  {confirmado.descuentoPorcentaje > 0
                    ? ` · ahorraste ${lempiras(confirmado.factura.descuento)} (${confirmado.descuentoPorcentaje} %)`
                    : ''}
                </p>
                <button
                  onClick={cerrar}
                  className="mt-4 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-fg"
                >
                  Seguir pidiendo
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
                <ShoppingBag className="h-12 w-12 text-muted" strokeWidth={1.25} />
                <p className="font-semibold">Tu carrito está vacío</p>
                <Link
                  to="/menu"
                  onClick={cerrar}
                  className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-fg"
                >
                  Ver el menú
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
                  <ul className="space-y-3">
                    <AnimatePresence initial={false}>
                      {items.map((i) => (
                        <motion.li
                          key={i.productoId}
                          layout
                          initial={{ opacity: 0, x: 24 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 24 }}
                          className="flex items-center gap-3 rounded-2xl border border-border bg-bg p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold">{i.nombre}</p>
                            <p className="text-sm text-muted">{lempiras(i.precio)} c/u</p>
                          </div>
                          <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-0.5">
                            <button
                              aria-label="Quitar una unidad"
                              onClick={() => cambiarCantidad(i.productoId, i.cantidad - 1)}
                              className="grid h-7 w-7 place-items-center rounded-full hover:bg-surface-2"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold">{i.cantidad}</span>
                            <button
                              aria-label="Agregar una unidad"
                              onClick={() => cambiarCantidad(i.productoId, i.cantidad + 1)}
                              className="grid h-7 w-7 place-items-center rounded-full hover:bg-surface-2"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <button
                            aria-label={`Quitar ${i.nombre}`}
                            onClick={() => quitar(i.productoId)}
                            className="text-muted hover:text-primary"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>

                  {/* Identificación del cliente (provisional, hasta tener login) */}
                  <section className="space-y-2">
                    <h3 className="font-display text-lg font-bold">¿Quién pide?</h3>
                    {correo ? (
                      <div className="flex items-center justify-between rounded-2xl border border-border bg-bg px-3 py-2 text-sm">
                        <span className="truncate">{correo}</span>
                        <button onClick={olvidar} className="ml-3 shrink-0 font-medium text-primary">
                          Cambiar
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={borrador}
                          onChange={(e) => setBorrador(e.target.value)}
                          placeholder="tu@correo.com"
                          className="h-10 min-w-0 flex-1 rounded-full border border-border bg-bg px-4 text-sm outline-none focus:border-primary"
                        />
                        <button
                          disabled={!correoValido}
                          onClick={() => setCorreo(borrador)}
                          className="rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg disabled:opacity-40"
                        >
                          Usar
                        </button>
                      </div>
                    )}

                    {descuento.isFetching && <p className="text-xs text-muted">Consultando tu nivel…</p>}
                    {clienteNoExiste && (
                      <p className="text-sm text-primary">
                        No encontramos un cliente con ese correo.{' '}
                        <Link to="/perfil" onClick={cerrar} className="font-semibold underline">
                          Regístrate aquí
                        </Link>
                      </p>
                    )}
                    {descuento.isError && !clienteNoExiste && (
                      <p className="text-sm text-primary">{descuento.error.message}</p>
                    )}
                    {descuento.isSuccess && (
                      <div className="rounded-2xl bg-accent/15 px-3 py-2">
                        <p className="flex items-center gap-2 text-sm">
                          <BadgePercent className="h-4 w-4 text-accent" />
                          <span>
                            Nivel <b>{descuento.data.nivel}</b>
                            {porcentaje > 0 ? ` · ${porcentaje} % de descuento` : ' · sin descuento por ahora'}
                          </span>
                        </p>
                        
                      </div>
                    )}
                  </section>

                  <section className="space-y-2">
                    <h3 className="font-display text-lg font-bold">Método de pago</h3>
                    <div className="flex flex-wrap gap-2">
                      {metodos.data?.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setMetodoId(m.id)}
                          className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                            metodoElegido === m.id
                              ? 'border-transparent bg-primary text-primary-fg'
                              : 'border-border bg-bg text-muted'
                          }`}
                        >
                          {m.nombre}
                        </button>
                      ))}
                      {metodos.isError && <p className="text-sm text-primary">No se pudieron cargar los métodos de pago</p>}
                    </div>
                  </section>
                </div>

                <footer className="space-y-3 border-t border-border px-5 py-4">
                  {calculo.isError && <p className="text-sm text-primary">{calculo.error.message}</p>}
                  {calculo.data && (
                    <dl className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted">Subtotal</dt>
                        <dd>{lempiras(calculo.data.subtotal)}</dd>
                      </div>
                      {calculo.data.descuento > 0 && (
                        <div className="flex justify-between text-accent">
                          <dt>Descuento</dt>
                          <dd>-{lempiras(calculo.data.descuento)}</dd>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <dt className="text-muted">Impuesto (ISV)</dt>
                        <dd>{lempiras(calculo.data.impuesto)}</dd>
                      </div>
                      <div className="flex items-baseline justify-between border-t border-border pt-3">
                        <dt className="font-semibold">Total</dt>
                        <dd className="text-2xl font-bold text-primary">
                          <AnimatedPrice valor={calculo.data.total} />
                        </dd>
                      </div>
                    </dl>
                  )}

                  {crear.isError && <p className="text-sm text-primary">{crear.error.message}</p>}
                  <button
                    disabled={!puedeConfirmar}
                    onClick={confirmar}
                    className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-fg transition-opacity disabled:opacity-40"
                  >
                    {crear.isPending ? 'Enviando…' : 'Confirmar pedido'}
                  </button>
                  {!correo && <p className="text-center text-xs text-muted">Indica tu correo para confirmar</p>}
                </footer>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}