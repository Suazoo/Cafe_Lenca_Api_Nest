import { Coffee } from 'lucide-react';
import { motion } from 'motion/react';
import type { DescuentoClienteDto, NivelCliente, PerfilClienteDto } from '@cafe-lenca/shared';
import { mesAnio } from '../../lib/format';

const ETIQUETA_NIVEL: Record<NivelCliente, string> = {
  VIP: 'Cliente VIP',
  FRECUENTE: 'Cliente frecuente',
  NUEVO: 'Cliente nuevo',
  REGULAR: 'Cliente de la casa',
};

interface Props {
  perfil: PerfilClienteDto;
  nivel?: DescuentoClienteDto;
}

export default function TarjetaCliente({ perfil, nivel }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 160, damping: 18 }}
      className="relative overflow-hidden rounded-3xl p-6 text-primary-fg shadow-xl shadow-primary/20"
      style={{ background: 'linear-gradient(135deg, var(--primary), var(--gold))' }}
    >
      <Coffee className="pointer-events-none absolute -bottom-6 -right-6 h-40 w-40 opacity-15" strokeWidth={1} />

      <div className="relative flex items-start justify-between">
        <span className="font-display text-lg font-bold">Café Lenca</span>
        <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
          {nivel ? ETIQUETA_NIVEL[nivel.nivel] : 'Cliente'}
        </span>
      </div>

      <p className="relative mt-10 font-display text-3xl font-bold leading-tight">{perfil.nombreCompleto}</p>
      <p className="relative mt-1 text-sm opacity-80">{perfil.correo}</p>
      {perfil.telefonos[0] && <p className="relative text-sm opacity-80">{perfil.telefonos[0]}</p>}

      <div className="relative mt-6 flex items-end justify-between gap-3 text-xs opacity-90">
        <span>
          {perfil.fechaRegistro ? `Cliente desde ${mesAnio(perfil.fechaRegistro)}` : 'Cliente de la casa'}
        </span>
        {nivel && nivel.descuentoPorcentaje > 0 && (
          <span className="rounded-full bg-black/20 px-3 py-1 font-semibold">
            {nivel.descuentoPorcentaje} % de descuento
          </span>
        )}
      </div>
    </motion.div>
  );
}