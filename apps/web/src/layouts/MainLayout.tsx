import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import CommandPalette from '../components/CommandPalette';
import ThemeToggle from '../components/ui/ThemeToggle';
import {
  CalendarDays,
  House,
  Receipt,
  Search,
  ShoppingBag,
  Sparkles,
  UserRound,
  UtensilsCrossed,
} from 'lucide-react';
import CartDrawer from '../features/cart/CartDrawer';
import { totalUnidades, useCarrito } from '../features/cart/cart.store';
import BaristaChat from '../features/barista/BaristaChat';

const ENLACES = [
  { to: '/', etiqueta: 'Inicio', Icono: House, end: true, movil: true },
  { to: '/menu', etiqueta: 'Menú', Icono: UtensilsCrossed, end: false, movil: true },
  { to: '/reservas', etiqueta: 'Reservas', Icono: CalendarDays, end: false, movil: true },
  { to: '/pedidos', etiqueta: 'Pedidos', Icono: Receipt, end: false, movil: true },
  { to: '/perfil', etiqueta: 'Perfil', Icono: UserRound, end: false, movil: true },
  { to: '/paradigmas', etiqueta: 'Detrás de escena', Icono: Sparkles, end: false, movil: false },
];

export default function MainLayout() {
  const [buscando, setBuscando] = useState(false);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const unidades = useCarrito((s) => totalUnidades(s.items));

  // Atajo global: Ctrl + K (o Cmd + K)
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setBuscando((v) => !v);
      }
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, []);

  return (
    <div className="min-h-dvh pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <NavLink to="/" className="font-display text-xl font-bold tracking-tight">
            Café <span className="text-primary">Lenca</span>
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {ENLACES.map(({ to, etiqueta, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary text-primary-fg' : 'text-muted hover:text-text'
                  }`
                }
              >
                {etiqueta}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setBuscando(true)}
              aria-label="Buscar (Ctrl + K)"
              className="flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-3 text-sm text-muted transition-colors hover:text-text"
            >
              <Search className="h-4 w-4" />
              <span className="hidden lg:inline">Buscar</span>
              <kbd className="hidden rounded border border-border px-1.5 text-[11px] lg:inline">Ctrl K</kbd>
            </button>
            <button
              onClick={() => setCarritoAbierto(true)}
              aria-label={`Abrir carrito, ${unidades} productos`}
              className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-surface text-muted transition-colors hover:text-text"
            >
              <ShoppingBag className="h-4 w-4" />
              {unidades > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-fg">
                  {unidades}
                </span>
              )}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-8 text-center text-xs text-muted">
        Fotos de productos de{' '}
        <a
          href="https://unsplash.com/?utm_source=cafe_lenca&utm_medium=referral"
          target="_blank"
          rel="noreferrer noopener"
          className="font-semibold underline"
        >
          Unsplash
        </a>
      </footer>

      {/* Barra inferior solo en móvil */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/90 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md justify-around py-2">
          {ENLACES.filter((e) => e.movil).map(({ to, etiqueta, Icono, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 text-[11px] font-medium ${
                  isActive ? 'text-primary' : 'text-muted'
                }`
              }
            >
              <Icono className="h-5 w-5" />
              {etiqueta}
            </NavLink>
          ))}
        </div>
      </nav>
      <BaristaChat />
      <CartDrawer abierto={carritoAbierto} onCerrar={() => setCarritoAbierto(false)} />

      <CommandPalette abierto={buscando} onCerrar={() => setBuscando(false)} />
    </div>
  );
}