import { useEffect } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import { useTema } from '../../features/theme/theme.store';
import type { Tema } from '../../features/theme/theme.store';

const OPCIONES: { valor: Tema; Icono: typeof Sun; etiqueta: string }[] = [
  { valor: 'light', Icono: Sun, etiqueta: 'Modo claro' },
  { valor: 'dark', Icono: Moon, etiqueta: 'Modo oscuro' },
  { valor: 'system', Icono: Monitor, etiqueta: 'Según el sistema' },
];

export default function ThemeToggle() {
  const tema = useTema((s) => s.tema);
  const setTema = useTema((s) => s.setTema);

  // En modo "sistema", reacciona cuando el sistema cambia de tema
  useEffect(() => {
    if (tema !== 'system') return;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const alCambiar = () => setTema('system');
    mq.addEventListener('change', alCambiar);
    return () => mq.removeEventListener('change', alCambiar);
  }, [tema, setTema]);

  return (
    <div role="radiogroup" aria-label="Tema" className="flex rounded-full border border-border bg-surface p-1">
      {OPCIONES.map(({ valor, Icono, etiqueta }) => {
        const activo = tema === valor;
        return (
          <button
            key={valor}
            role="radio"
            aria-checked={activo}
            aria-label={etiqueta}
            title={etiqueta}
            onClick={() => setTema(valor)}
            className="relative grid h-8 w-8 place-items-center rounded-full"
          >
            {activo && (
              <motion.span
                layoutId="tema-activo"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <Icono className={`relative h-4 w-4 ${activo ? 'text-primary-fg' : 'text-muted'}`} />
          </button>
        );
      })}
    </div>
  );
}