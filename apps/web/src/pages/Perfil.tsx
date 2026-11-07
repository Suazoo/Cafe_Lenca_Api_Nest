import { useState } from 'react';
import { motion } from 'motion/react';
import { useDescuento } from '../features/cart/cart.api';
import IdentificarCliente from '../features/cliente/IdentificarCliente';
import Preferencias from '../features/cliente/Preferencias';
import RegistroForm from '../features/cliente/RegistroForm';
import TarjetaCliente from '../features/cliente/TarjetaCliente';
import { usePerfil } from '../features/cliente/cliente.api';
import { useCliente } from '../features/cliente/cliente.store';
import { ApiError } from '../lib/api';
import { lempiras } from '../lib/format';

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 text-center">
      <p className="text-xl font-bold text-primary">{valor}</p>
      <p className="mt-0.5 text-xs text-muted">{etiqueta}</p>
    </div>
  );
}

export default function Perfil() {
  const correo = useCliente((s) => s.correo);
  const olvidar = useCliente((s) => s.olvidar);
  const perfil = usePerfil(correo);
  const nivel = useDescuento(correo, perfil.isSuccess);
  const [modo, setModo] = useState<'registro' | 'entrar'>('registro');

  const noEncontrado = perfil.error instanceof ApiError && perfil.error.status === 404;

  // Sin sesión: crear cuenta o entrar con un correo ya registrado
  if (!correo) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="text-4xl font-bold md:text-5xl">Mi perfil</h1>
        <p className="mt-1 text-sm text-muted">Crea tu cuenta para pedir, reservar y recibir sugerencias.</p>

        <div className="mt-6 flex w-fit rounded-full border border-border bg-surface p-1 text-sm font-medium">
          {(['registro', 'entrar'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setModo(m)}
              className={`rounded-full px-4 py-1.5 transition-colors ${
                modo === m ? 'bg-primary text-primary-fg' : 'text-muted'
              }`}
            >
              {m === 'registro' ? 'Soy nuevo' : 'Ya tengo cuenta'}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-3xl border border-border bg-surface p-5">
          {modo === 'registro' ? (
            <RegistroForm />
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted">Escribe el correo con el que te registraste.</p>
              <IdentificarCliente />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (perfil.isPending) {
    return (
      <div className="grid gap-6 lg:grid-cols-[24rem_1fr]">
        <div className="h-64 animate-pulse rounded-3xl bg-surface-2" />
        <div className="h-64 animate-pulse rounded-3xl bg-surface-2" />
      </div>
    );
  }

  if (perfil.isError) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="text-4xl font-bold">Mi perfil</h1>
        {noEncontrado ? (
          <>
            <p className="mt-2 text-sm text-muted">
              No encontramos un cliente con <b>{correo}</b>. Completa tus datos para crear tu cuenta.
            </p>
            <div className="mt-4 rounded-3xl border border-border bg-surface p-5">
              <RegistroForm correoInicial={correo} />
            </div>
          </>
        ) : (
          <div className="mt-4 rounded-3xl border border-border bg-surface p-8 text-center">
            <p className="font-semibold">No pudimos cargar tu perfil</p>
            <p className="mt-1 text-sm text-muted">{perfil.error.message}</p>
            <button
              onClick={() => void perfil.refetch()}
              className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-fg"
            >
              Reintentar
            </button>
          </div>
        )}
        <button onClick={olvidar} className="mt-4 text-sm font-medium text-primary">
          Usar otro correo
        </button>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold md:text-5xl">Hola, {perfil.data.nombreCompleto.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-muted">Tu espacio en Café Lenca.</p>
        </div>
        <button onClick={olvidar} className="text-sm font-medium text-primary">
          No soy yo
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[24rem_1fr] lg:items-start">
        <div className="space-y-4">
          <TarjetaCliente perfil={perfil.data} nivel={nivel.data} />
          {nivel.data && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-3 gap-3"
            >
              <Dato etiqueta="Pedidos" valor={String(nivel.data.pedidosTotales)} />
              <Dato etiqueta="Este mes" valor={String(nivel.data.pedidosUltimos30Dias)} />
              <Dato etiqueta="Total gastado" valor={lempiras(nivel.data.gastoTotal)} />
            </motion.div>
          )}
        </div>

        <Preferencias perfil={perfil.data} correo={correo} />
      </div>
    </div>
  );
}