import { useState } from 'react';
import { useCliente } from './cliente.store';

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function IdentificarCliente() {
  const correo = useCliente((s) => s.correo);
  const setCorreo = useCliente((s) => s.setCorreo);
  const olvidar = useCliente((s) => s.olvidar);
  const [borrador, setBorrador] = useState('');

  if (correo) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-border bg-bg px-3 py-2 text-sm">
        <span className="truncate">{correo}</span>
        <button onClick={olvidar} className="ml-3 shrink-0 font-medium text-primary">
          Cambiar
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        type="email"
        value={borrador}
        onChange={(e) => setBorrador(e.target.value)}
        placeholder="tu@correo.com"
        aria-label="Tu correo"
        className="h-10 min-w-0 flex-1 rounded-full border border-border bg-bg px-4 text-sm outline-none focus:border-primary"
      />
      <button
        disabled={!REGEX_CORREO.test(borrador.trim())}
        onClick={() => setCorreo(borrador)}
        className="rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg disabled:opacity-40"
      >
        Usar
      </button>
    </div>
  );
}