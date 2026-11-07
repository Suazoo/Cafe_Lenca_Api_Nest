import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import MenuFilters from '../features/menu/MenuFilters';
import ProductCard from '../features/menu/ProductCard';
import { FILTROS_INICIALES, useMenu } from '../features/menu/menu.api';
import type { FiltrosMenu } from '../features/menu/menu.api';

export default function Menu() {
  const [filtros, setFiltros] = useState<FiltrosMenu>(FILTROS_INICIALES);
  const completo = useMenu(FILTROS_INICIALES); // para armar los chips y el tope del precio
  const filtrado = useMenu(filtros); // lo que se muestra
  const [params] = useSearchParams();
  const destacadoId = Number(params.get('p')) || null;

  const categorias = useMemo(
    () =>
      (completo.data ?? []).flatMap((g) =>
        g.categoriaId === null ? [] : [{ id: g.categoriaId, nombre: g.categoria }],
      ),
    [completo.data],
  );

  const techoPrecio = useMemo(
    () => Math.ceil(Math.max(0, ...(completo.data ?? []).flatMap((g) => g.items.map((i) => i.precio)))),
    [completo.data],
  );

  const grupos = filtrado.data ?? [];
  

  // Si llegas desde la paleta (?p=ID), baja hasta ese producto
  useEffect(() => {
    if (destacadoId === null || !filtrado.isSuccess) return;
    document.getElementById(`p-${destacadoId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [destacadoId, filtrado.isSuccess]);

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-4xl font-bold md:text-5xl">Nuestro menú</h1>
         
      </header>

      <MenuFilters categorias={categorias} techoPrecio={techoPrecio} filtros={filtros} onChange={setFiltros} />

      {filtrado.isPending ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-3xl bg-surface-2" />
          ))}
        </div>
      ) : filtrado.isError ? (
        <div className="mt-8 rounded-3xl border border-border bg-surface p-10 text-center">
          <p className="font-semibold">No pudimos cargar el menú</p>
          <p className="mt-1 text-sm text-muted">{filtrado.error.message}</p>
          <button
            onClick={() => void filtrado.refetch()}
            className="mt-4 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-fg"
          >
            Reintentar
          </button>
        </div>
      ) : grupos.length === 0 ? (
        <div className="mt-8 grid place-items-center rounded-3xl border border-border bg-surface px-6 py-16 text-center">
          <SearchX className="h-10 w-10 text-muted" strokeWidth={1.25} />
          <p className="mt-3 font-semibold">Nada coincide con esos filtros</p>
          <p className="text-sm text-muted">Prueba con otra categoría o un precio más alto.</p>
        </div>
      ) : (
        grupos.map((g) => (
          <section key={g.categoriaId ?? 'otros'} className="mt-8">
            <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold">
              {g.categoria}
              <span className="h-px flex-1 bg-border" />
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((item, i) => (
                <ProductCard key={item.id} item={item} indice={i} destacado={item.id === destacadoId} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}