/**
 * PARADIGMA: Funcional
 * Cumple: funciones puras que convierten datos en hechos Prolog (sin efectos
 *         ni estado), con map y composición.
 * Usado en: LogicService (alimenta el motor Prolog)
 */
export interface DatosCliente {
  idCliente: number;
  pedidosMes: number;
  pedidosTotal: number;
  gastoTotal: number;
  compras: number[];
  preferencias: { tipo: string; valor: string }[];
  productos: { id: number; nombre: string; categoria: string | null; precio: number }[];
  populares: number[];
}

// "Café con Leche" -> "cafe_con_leche" (átomo seguro para Prolog)
export const slug = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const atomo = (texto: string): string => `'${slug(texto)}'`;
const decimal = (n: number): string => n.toFixed(2);

export const construirHechos = (d: DatosCliente): string =>
  [
    `cliente(${d.idCliente}).`,
    `pedidos_mes(${d.idCliente}, ${d.pedidosMes}).`,
    `pedidos_total(${d.idCliente}, ${d.pedidosTotal}).`,
    `gasto_total(${d.idCliente}, ${decimal(d.gastoTotal)}).`,
    ...d.compras.map((id) => `compro(${d.idCliente}, ${id}).`),
    ...d.preferencias.map(
      (p) => `preferencia(${d.idCliente}, ${atomo(p.tipo)}, ${atomo(p.valor)}).`,
    ),
    ...d.productos.map(
      (p) =>
        `producto(${p.id}, ${atomo(p.nombre)}, ${atomo(p.categoria ?? 'sin_categoria')}, ${decimal(p.precio)}).`,
    ),
    ...d.populares.map((id) => `popular(${id}).`),
  ].join('\n');