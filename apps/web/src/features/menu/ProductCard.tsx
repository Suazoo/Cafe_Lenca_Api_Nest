import { useEffect, useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import type { MenuItemDto } from '@cafe-lenca/shared';
import { lempiras } from '../../lib/format';
import { useCarrito } from '../cart/cart.store';
import ProductImage from './ProductImage';

interface Props {
  item: MenuItemDto;
  indice: number;
  destacado: boolean;
}

export default function ProductCard({ item, indice, destacado }: Props) {
  const agregar = useCarrito((s) => s.agregar);
  const [agregado, setAgregado] = useState(false);

  // El check de "agregado" dura un instante
  useEffect(() => {
    if (!agregado) return;
    const t = setTimeout(() => setAgregado(false), 1200);
    return () => clearTimeout(t);
  }, [agregado]);

  return (
    <motion.article
      id={`p-${item.id}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.35, delay: Math.min(indice, 8) * 0.04 } }}
      whileHover={{ y: -4 }}
      className={`group flex flex-col overflow-hidden rounded-3xl border border-border bg-surface transition-shadow hover:shadow-xl hover:shadow-primary/10 ${
        destacado ? 'destacado' : ''
      }`}
    >
      <div className="relative">
        <ProductImage
          imagen={item.imagen}
          nombre={item.nombre}
          categoria={item.categoria}
          className="aspect-[4/3] w-full"
        />
        {item.categoria && (
          <span className="absolute left-3 top-3 rounded-full bg-bg/80 px-2.5 py-1 text-xs font-medium backdrop-blur">
            {item.categoria}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-lg font-bold leading-snug">{item.nombre}</h3>
        {item.descripcion && <p className="line-clamp-2 text-sm text-muted">{item.descripcion}</p>}

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-bold text-primary">{lempiras(item.precio)}</span>
          <motion.button
            whileTap={{ scale: 0.92 }}
            aria-label={`Agregar ${item.nombre} al carrito`}
            onClick={() => {
              agregar({ productoId: item.id, nombre: item.nombre, precio: item.precio });
              setAgregado(true);
            }}
            className={`flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-colors ${
              agregado ? 'bg-accent text-bg' : 'bg-primary text-primary-fg'
            }`}
          >
            {agregado ? (
              <>
                <Check className="h-4 w-4" /> Listo
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Agregar
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}