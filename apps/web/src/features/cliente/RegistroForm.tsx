import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRegistrar } from './cliente.api';
import { useCliente } from './cliente.store';

const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CAMPOS = [
  { clave: 'pNombre', etiqueta: 'Primer nombre *', type: 'text', auto: 'given-name', max: 45, completo: false },
  { clave: 'sNombre', etiqueta: 'Segundo nombre', type: 'text', auto: 'additional-name', max: 45, completo: false },
  { clave: 'pApellido', etiqueta: 'Primer apellido *', type: 'text', auto: 'family-name', max: 45, completo: false },
  { clave: 'sApellido', etiqueta: 'Segundo apellido', type: 'text', auto: 'off', max: 45, completo: false },
  { clave: 'correo', etiqueta: 'Correo *', type: 'email', auto: 'email', max: 100, completo: true },
  { clave: 'telefono', etiqueta: 'Teléfono', type: 'tel', auto: 'tel', max: 45, completo: true },
] as const;

export default function RegistroForm({ correoInicial = '' }: { correoInicial?: string }) {
  const qc = useQueryClient();
  const setCorreo = useCliente((s) => s.setCorreo);
  const registrar = useRegistrar();
  const [f, setF] = useState({
    pNombre: '',
    sNombre: '',
    pApellido: '',
    sApellido: '',
    correo: correoInicial,
    telefono: '',
  });

  const cambiar = (clave: keyof typeof f) => (e: ChangeEvent<HTMLInputElement>) =>
    setF((s) => ({ ...s, [clave]: e.target.value }));

  const valido =
    f.pNombre.trim() !== '' && f.pApellido.trim() !== '' && REGEX_CORREO.test(f.correo.trim());

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (!valido) return;
    registrar.mutate(
      {
        pNombre: f.pNombre.trim(),
        sNombre: f.sNombre.trim() || undefined,
        pApellido: f.pApellido.trim(),
        sApellido: f.sApellido.trim() || undefined,
        correo: f.correo.trim(),
        telefono: f.telefono.trim() || undefined,
      },
      {
        onSuccess: (perfil) => {
          qc.setQueryData(['perfil', perfil.correo], perfil);
          setCorreo(perfil.correo);
        },
      },
    );
  };

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {CAMPOS.map((c) => (
          <label key={c.clave} className={`block text-sm font-medium ${c.completo ? 'sm:col-span-2' : ''}`}>
            {c.etiqueta}
            <input
              type={c.type}
              value={f[c.clave]}
              onChange={cambiar(c.clave)}
              autoComplete={c.auto}
              maxLength={c.max}
              className="mt-1.5 h-11 w-full rounded-2xl border border-border bg-bg px-3 text-sm outline-none focus:border-primary"
            />
          </label>
        ))}
      </div>

      {registrar.isError && <p className="text-sm text-primary">{registrar.error.message}</p>}

      <button
        type="submit"
        disabled={!valido || registrar.isPending}
        className="h-12 w-full rounded-full bg-primary font-semibold text-primary-fg transition-opacity disabled:opacity-40"
      >
        {registrar.isPending ? 'Creando tu cuenta…' : 'Crear mi cuenta'}
      </button>
    </form>
  );
}