import type { ImagenProductoDto } from '@cafe-lenca/shared';
import type { ProductoImagen } from './producto-imagen.entity';

export const aImagenDto = (i: ProductoImagen): ImagenProductoDto => ({
  url: i.url,
  urlGrande: i.urlGrande,
  fotografo: i.fotografo,
  fotografoUrl: i.fotografoUrl,
  paginaUrl: i.paginaUrl,
});