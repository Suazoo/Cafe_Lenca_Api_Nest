import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { PerfilClienteDto } from '@cafe-lenca/shared';
import { FILTROS_INICIALES, useMenu } from '../menu/menu.api';
import { useAgregarPreferencia } from './cliente.api';

const TIPOS = [
  { valor: 'bebida_favorita', etiqueta: 'Bebida favorita', fuente: 'producto' },
  { valor: 'comida_favorita', etiqueta: 'Comida favorita', fuente: 'producto' },
  { valor: 'producto_favorito', etiqueta: 'Producto favorito', fuente: 'producto' },
  { valor: 'categoria_favorita', etiqueta: 'Categoría favorita', fuente: 'categoria' },
] as const;

type TipoPreferencia = (typeof TIPOS)[number]['valor'];

const ETIQUETAS: Record<string, string> = Object.fromEntries(TIPOS.map((t) => [t.valor, t.etiqueta]));

const SELECT =
  'h-11 w-full rounded-2xl border border-border bg-bg px-3 text-sm outline-none focus:border-primary';

export default function Preferencias({ perfil, correo }: { perfil: PerfilClienteDto; correo: string }) {
  const menu = useMenu(FILTROS_INICIALES);
  const agregar = useAgregarPreferencia(correo);
  const [tipo, setTipo] = useState<TipoPreferencia>(TIPOS[0].valor);
  const [valor, setValor] = useState('');

  const definicion = TIPOS.find((t) => t.valor === tipo) ?? TIPOS[0];

  // Las opciones salen del menú real, para que siempre coincidan con los productos
  const opciones = useMemo(() => {
    const grupos = menu.data ?? [];
    return definicion.fuente === 'categoria'
      ? grupos.filter((g) => g.categoriaId !== null).map((g) => g.categoria)
      : grupos.flatMap((g) => g.items.map((i) => i.nombre));
  }, [menu.data, definicion.fuente]);

  return (
    <section className="rounded-3xl border border-border bg-surface p-5">
      <h2 className="text-2xl font-bold">Tus preferencias</h2>
      <p className="mt-1 text-sm text-muted">Cuéntanos qué te gusta y te sugeriremos lo mejor de la casa.</p>

      <ul className="mt-4 flex flex-wrap gap-2">
        <AnimatePresence initial={false}>
          {perfil.preferencias.map((p) => (
            <motion.li
              key={p.id ?? `${p.tipo}-${p.valor}`}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-full border border-border bg-bg px-3 py-1.5 text-sm"
            >
              <span className="text-muted">{ETIQUETAS[p.tipo] ?? p.tipo.replace(/_/g, ' ')}:</span>{' '}
              <b>{p.valor}</b>
            </motion.li>
          ))}
        </AnimatePresence>
        {perfil.preferencias.length === 0 && <li className="text-sm text-muted">Aún no has agregado ninguna.</li>}
      </ul>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_1.4fr_auto]">
        <select
          aria-label="Tipo de preferencia"
          value={tipo}
          onChange={(e) => {
            setTipo(e.target.value as TipoPreferencia);
            setValor('');
            agregar.reset();
          }}
          className={SELECT}
        >
          {TIPOS.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.etiqueta}
            </option>
          ))}
        </select>

        <select
          aria-label="Valor de la preferencia"
          value={valor}
          onChange={(e) => {
            setValor(e.target.value);
            agregar.reset();
          }}
          className={SELECT}
        >
          <option value="">Elige una opción…</option>
          {opciones.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>

        <button
          disabled={valor === '' || agregar.isPending}
          onClick={() =>
            agregar.mutate({ idCliente: perfil.idCliente, tipo, valor }, { onSuccess: () => setValor('') })
          }
          className="flex h-11 items-center justify-center gap-1.5 rounded-full bg-primary px-5 text-sm font-semibold text-primary-fg disabled:opacity-40"
        >
          <Plus className="h-4 w-4" /> Agregar
        </button>
      </div>

      {agregar.isError && <p className="mt-3 text-sm text-primary">{agregar.error.message}</p>}
    </section>
  );
}