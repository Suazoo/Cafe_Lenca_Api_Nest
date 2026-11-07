import { useEffect } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { lempiras } from '../../lib/format';

// Cuenta suavemente hasta el nuevo valor cuando el total cambia
export default function AnimatedPrice({ valor }: { valor: number }) {
  const mv = useMotionValue(valor);
  const texto = useTransform(mv, (v) => lempiras(v));

  useEffect(() => {
    const control = animate(mv, valor, { duration: 0.5, ease: 'easeOut' });
    return () => control.stop();
  }, [valor, mv]);

  return <motion.span>{texto}</motion.span>;
}