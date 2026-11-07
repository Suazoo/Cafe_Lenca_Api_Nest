import { useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  CalendarDays,
  CornerDownLeft,
  House,
  Receipt,
  Search,
  Sparkles,
  UserRound,
  UtensilsCrossed,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { iconoCategoria } from '../features/menu/categoria-icono';
import { FILTROS_INICIALES, useMenu } from '../features/menu/menu.api';
import { lempiras, normalizar } from '../lib/format';

interface Resultado {
  clave: string;
  titulo: string;
  detalle: string;
  Icono: LucideIcon;
  ir: string;
  buscable: string;
}

const pagina = (clave: string, titulo: string, Icono: LucideIcon, ir: string): Resultado => ({
  clave,
  titulo,
  detalle: 'Ir a la pantalla',
  Icono,
  ir,
  buscable: normalizar(titulo),
});

const PAGINAS: Resultado[] = [
  pagina('inicio', 'Inicio', House, '/'),
  pagina('menu', 'Menú', UtensilsCrossed, '/menu'),
  pagina('reservas', 'Reservas', CalendarDays, '/reservas'),
  pagina('pedidos', 'Mis pedidos', Receipt, '/pedidos'),
  pagina('perfil', 'Mi perfil', UserRound, '/perfil'),
  pagina('paradigmas', 'Detrás de escena', Sparkles, '/paradigmas'),
];

interface Props {
  abierto: boolean;
  onCerrar: () => void;
}

export default function CommandPalette({ abierto, onCerrar }: Props) {
  const navigate = useNavigate();
  const { data } = useMenu(FILTROS_INICIALES);
  const [texto, setTexto] = useState('');
  const [indice, setIndice] = useState(0);

  const productos = useMemo<Resultado[]>(
    () =>
      (data ?? [])
        .flatMap((g) => g.items)
        .map((i) => ({
          clave: `p-${i.id}`,
          titulo: i.nombre,
          detalle: `${i.categoria ?? 'Producto'} · ${lempiras(i.precio)}`,
          Icono: iconoCategoria(i.categoria),
          ir: `/menu?p=${i.id}`,
          buscable: normalizar(`${i.nombre} ${i.descripcion ?? ''} ${i.categoria ?? ''}`),
        })),
    [data],
  );

  const resultados = useMemo(() => {
    const q = normalizar(texto.trim());
    const todos = [...PAGINAS, ...productos];
    return (q ? todos.filter((r) => r.buscable.includes(q)) : todos).slice(0, 9);
  }, [texto, productos]);

  const cerrar = () => {
    setTexto('');
    setIndice(0);
    onCerrar();
  };

  const elegir = (r: Resultado | undefined) => {
    if (!r) return;
    navigate(r.ir);
    cerrar();
  };

  const alTeclear = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndice((i) => Math.min(i + 1, resultados.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndice((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      elegir(resultados[indice]);
    } else if (e.key === 'Escape') {
      cerrar();
    }
  };

  return (
    <AnimatePresence>
      {abierto && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={cerrar}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Buscar"
            className="w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl"
            initial={{ y: -12, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -12, scale: 0.97 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="h-5 w-5 text-muted" />
              <input
                autoFocus
                value={texto}
                onChange={(e) => {
                  setTexto(e.target.value);
                  setIndice(0);
                }}
                onKeyDown={alTeclear}
                placeholder="Busca un producto o una pantalla…"
                className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
              />
              <kbd className="rounded-md border border-border px-1.5 py-0.5 text-xs text-muted">Esc</kbd>
            </div>

            <ul className="max-h-80 overflow-y-auto p-2">
              {resultados.length === 0 && (
                <li className="px-3 py-8 text-center text-sm text-muted">Sin resultados para “{texto}”</li>
              )}
              {resultados.map((r, i) => (
                <li key={r.clave}>
                  <button
                    onClick={() => elegir(r)}
                    onMouseEnter={() => setIndice(i)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left ${
                      i === indice ? 'bg-surface-2' : ''
                    }`}
                  >
                    <r.Icono className="h-5 w-5 shrink-0 text-primary" />
                    <span className="flex-1">
                      <span className="block text-sm font-medium">{r.titulo}</span>
                      <span className="block text-xs text-muted">{r.detalle}</span>
                    </span>
                    {i === indice && <CornerDownLeft className="h-4 w-4 text-muted" />}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}