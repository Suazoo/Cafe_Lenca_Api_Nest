import { useEffect, useState } from 'react';
import { Check, Plus, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import type { RecomendacionDto } from '@cafe-lenca/shared';
import { lempiras } from '../../lib/format';
import { useCarrito } from '../cart/cart.store';
import ProductImage from '../menu/ProductImage';
import { useImagenProducto } from '../menu/menu.api';

export default function RecomendacionCard({ item, indice }: { item: RecomendacionDto; indice: number }) {
  const agregar = useCarrito((s) => s.agregar);
  const imagen = useImagenProducto(item.productoId);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    if (!agregado) return;
    const t = setTimeout(() => setAgregado(false), 1200);
    return () => clearTimeout(t);
  }, [agregado]);

  return (
    <motion.article
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0, transition: { delay: indice * 0.06 } }}
      className="group w-64 shrink-0 snap-start overflow-hidden rounded-3xl border border-border bg-surface"
    >
      <div className="relative">
        <ProductImage imagen={imagen} nombre={item.nombre} categoria={item.categoria} className="h-36 w-full" />
        <span className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] items-center gap-1 rounded-full bg-bg/85 px-2.5 py-1 text-[11px] font-medium leading-tight backdrop-blur">
          <Sparkles className="h-3 w-3 shrink-0 text-gold" />
          {item.motivo}
        </span>
      </div>

      <div className="p-4">
        <h3 className="truncate text-lg font-bold">{item.nombre}</h3>
        <p className="text-xs text-muted">{item.categoria ?? 'De la casa'}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-bold text-primary">{lempiras(item.precio)}</span>
          <motion.button
            whileTap={{ scale: 0.92 }}
            aria-label={`Agregar ${item.nombre} al carrito`}
            onClick={() => {
              agregar({ productoId: item.productoId, nombre: item.nombre, precio: item.precio });
              setAgregado(true);
            }}
            className={`flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold transition-colors ${
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