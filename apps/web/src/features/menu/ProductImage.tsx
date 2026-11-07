import { useState } from 'react';
import type { ImagenProductoDto } from '@cafe-lenca/shared';
import { iconoCategoria } from './categoria-icono';

const UNSPLASH = 'https://unsplash.com/?utm_source=cafe_lenca&utm_medium=referral';

interface Props {
  imagen: ImagenProductoDto | null;
  nombre: string;
  categoria: string | null;
  className?: string;
  credito?: boolean;
}

export default function ProductImage({ imagen, nombre, categoria, className = '', credito = true }: Props) {
  const [cargada, setCargada] = useState(false);
  const [fallo, setFallo] = useState(false);

  // Sin foto (o si no carga) se muestra el ícono de la categoría
  if (!imagen || fallo) {
    const Icono = iconoCategoria(categoria);
    return (
      <div className={`patron-lenca grid place-items-center bg-surface-2 ${className}`}>
        <Icono className="h-12 w-12 text-primary/60" strokeWidth={1.25} />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-surface-2 ${className}`}>
      {!cargada && <div className="absolute inset-0 animate-pulse bg-surface-2" />}
      <img
        src={imagen.url}
        alt={nombre}
        loading="lazy"
        decoding="async"
        onLoad={() => setCargada(true)}
        onError={() => setFallo(true)}
        className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
          cargada ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {credito && imagen.fotografo && (
        <span className="absolute bottom-2 left-2 max-w-[90%] truncate rounded-full bg-black/55 px-2 py-0.5 text-[10px] text-white/90 backdrop-blur">
          Foto:{' '}
          <a
            href={imagen.fotografoUrl ?? UNSPLASH}
            target="_blank"
            rel="noreferrer noopener"
            className="underline"
          >
            {imagen.fotografo}
          </a>{' '}
          en{' '}
          <a href={UNSPLASH} target="_blank" rel="noreferrer noopener" className="underline">
            Unsplash
          </a>
        </span>
      )}
    </div>
  );
}