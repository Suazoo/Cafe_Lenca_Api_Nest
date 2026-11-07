/**
 * PARADIGMA: Funcional
 * Cumple: funciones puras e inmutables (nunca modifican sus argumentos),
 *         recursividad (sumar y mejorPor), reduce, map, filter y lambdas.
 * Usado en: GET /pedidos y GET /pedidos/estadisticas
 */
import type {
  EstadisticasClienteDto,
  FavoritoDto,
  GastoMesDto,
  LineaHistorialDto,
  PedidoHistorialDto,
} from '@cafe-lenca/shared';
import type { Pedido } from './pedido.entity';

const redondear = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

// Recursividad (divide y vencerás): suma una lista partiéndola por la mitad
export const sumar = (valores: readonly number[]): number => {
  if (valores.length === 0) return 0;
  if (valores.length === 1) return valores[0];
  const mitad = Math.floor(valores.length / 2);
  return sumar(valores.slice(0, mitad)) + sumar(valores.slice(mitad));
};

// Recursividad: elemento con mayor puntaje (compara el actual con el mejor del resto)
export const mejorPor = <T>(items: readonly T[], puntaje: (x: T) => number, desde = 0): T | null => {
  if (desde >= items.length) return null;
  const actual = items[desde];
  const mejorResto = mejorPor(items, puntaje, desde + 1);
  return mejorResto !== null && puntaje(mejorResto) > puntaje(actual) ? mejorResto : actual;
};

// map: convierte la entidad de la BD en el DTO del historial
export const aHistorial = (p: Pedido): PedidoHistorialDto => {
  const lineas: LineaHistorialDto[] = p.detalles.map((d) => ({
    productoId: d.productoId,
    nombre: d.producto.nombre,
    categoria: d.producto.categoria?.nombre ?? null,
    cantidad: d.cantidad,
    precioUnitario: d.precioUnitario,
    importe: redondear(d.cantidad * d.precioUnitario),
  }));
  const subtotalLineas = redondear(sumar(lineas.map((l) => l.importe)));
  const factura = p.facturas.length > 0 ? p.facturas[0] : null;

  return {
    idPedido: p.idPedido,
    fecha: p.fechaPedido?.toISOString() ?? null,
    mesaNumero: p.mesa?.numero ?? null,
    metodoPago: p.metodoPago?.nombre ?? null,
    numeroFactura: factura?.numeroFactura ?? null,
    lineas,
    unidades: lineas.reduce((n, l) => n + l.cantidad, 0),
    // Si el pedido no tiene factura, se usan los importes de sus líneas
    subtotal: factura?.subtotal ?? subtotalLineas,
    descuento: factura?.descuento ?? 0,
    impuesto: factura?.impuesto ?? 0,
    total: factura?.total ?? subtotalLineas,
  };
};

const claveMes = (iso: string): string => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

// reduce: suma las unidades por nombre (producto o categoría)
const contarUnidades = (
  lineas: readonly LineaHistorialDto[],
  clave: (l: LineaHistorialDto) => string | null,
): FavoritoDto[] =>
  Object.entries(
    lineas.reduce<Record<string, number>>((acc, l) => {
      const k = clave(l);
      return k === null ? acc : { ...acc, [k]: (acc[k] ?? 0) + l.cantidad };
    }, {}),
  ).map(([nombre, unidades]) => ({ nombre, unidades }));

export const calcularEstadisticas = (pedidos: readonly PedidoHistorialDto[]): EstadisticasClienteDto => {
  const lineas = pedidos.flatMap((p) => p.lineas);
  const gastoTotal = redondear(sumar(pedidos.map((p) => p.total)));

  // reduce: agrupa el gasto por mes sin mutar el acumulador
  const gastoPorMes: GastoMesDto[] = Object.values(
    pedidos.reduce<Record<string, GastoMesDto>>((acc, p) => {
      if (p.fecha === null) return acc;
      const mes = claveMes(p.fecha);
      const previo = acc[mes] ?? { mes, total: 0, pedidos: 0 };
      return {
        ...acc,
        [mes]: { mes, total: redondear(previo.total + p.total), pedidos: previo.pedidos + 1 },
      };
    }, {}),
  ).sort((a, b) => a.mes.localeCompare(b.mes));

  return {
    totalPedidos: pedidos.length,
    gastoTotal,
    ahorroTotal: redondear(sumar(pedidos.map((p) => p.descuento))),
    ticketPromedio: pedidos.length === 0 ? 0 : redondear(gastoTotal / pedidos.length),
    productoFavorito: mejorPor(contarUnidades(lineas, (l) => l.nombre), (f) => f.unidades),
    categoriaFavorita: mejorPor(contarUnidades(lineas, (l) => l.categoria), (f) => f.unidades),
    gastoPorMes,
  };
};