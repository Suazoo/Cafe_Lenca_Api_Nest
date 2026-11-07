export const APP_NAME = 'Café Lenca';

export interface MenuItemDto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  categoriaId: number | null;
  categoria: string | null;
  imagen: ImagenProductoDto | null;
}

export interface MenuCategoriaDto {
  categoriaId: number | null;
  categoria: string;
  items: MenuItemDto[];
}

export interface ProductoMasVendidoDto {
  id: number;
  nombre: string;
  categoria: string | null;
  unidadesVendidas: number;
  ingresos: number;
}

export interface VentasCategoriaDto {
  categoriaId: number;
  categoria: string;
  unidades: number;
  ingresos: number;
}

export interface ResumenCategoriaDto {
  categoriaId: number;
  categoria: string;
  totalProductos: number;
  precioPromedio: number;
  precioMaximo: number;
}

export interface LineaFacturaDto {
  productoId: number;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  importe: number;
}

export interface CalculoFacturaDto {
  lineas: LineaFacturaDto[];
  unidades: number;
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
}

export type NivelCliente = 'VIP' | 'FRECUENTE' | 'NUEVO' | 'REGULAR';

export interface CrearPedidoRespuestaDto {
  idPedido: number;
  numeroFactura: string;
  factura: CalculoFacturaDto;
  nivelCliente: NivelCliente;
  descuentoPorcentaje: number;
}

export interface PreferenciaDto {
  id: number | null;
  tipo: string;
  valor: string;
}

export interface PerfilClienteDto {
  idCliente: number;
  nombreCompleto: string;
  correo: string;
  telefonos: string[];
  preferencias: PreferenciaDto[];
  fechaRegistro: string | null;
}

export interface MesaDisponibleDto {
  idMesa: number;
  numero: number;
  capacidad: number;
}

export interface ReservaDto {
  idReserva: number;
  fecha: string;
  personas: number;
  estado: string;
  mesaId: number | null;
  mesaNumero: number | null;
}

export interface DescuentoClienteDto {
  idCliente: number;
  nivel: NivelCliente;
  descuentoPorcentaje: number;
  pedidosUltimos30Dias: number;
  pedidosTotales: number;
  gastoTotal: number;
}

export interface RecomendacionDto {
  productoId: number;
  nombre: string;
  categoria: string | null;
  precio: number;
  motivo: string;
}

export interface MetodoPagoDto {
  id: number;
  nombre: string;
}

export type EstadoMesaPlano = 'LIBRE' | 'OCUPADA' | 'PEQUENA';

export interface MesaPlanoDto {
  idMesa: number;
  numero: number;
  capacidad: number;
  estado: EstadoMesaPlano;
}

export interface LineaHistorialDto {
  productoId: number;
  nombre: string;
  categoria: string | null;
  cantidad: number;
  precioUnitario: number;
  importe: number;
}

export interface PedidoHistorialDto {
  idPedido: number;
  fecha: string | null;
  mesaNumero: number | null;
  metodoPago: string | null;
  numeroFactura: string | null;
  lineas: LineaHistorialDto[];
  unidades: number;
  subtotal: number;
  descuento: number;
  impuesto: number;
  total: number;
}

export interface GastoMesDto {
  mes: string; // formato AAAA-MM
  total: number;
  pedidos: number;
}

export interface FavoritoDto {
  nombre: string;
  unidades: number;
}

export interface EstadisticasClienteDto {
  totalPedidos: number;
  gastoTotal: number;
  ahorroTotal: number;
  ticketPromedio: number;
  productoFavorito: FavoritoDto | null;
  categoriaFavorita: FavoritoDto | null;
  gastoPorMes: GastoMesDto[];
}

export interface DemoBloque {
  titulo: string;
  lenguaje: 'json' | 'sql' | 'prolog' | 'texto';
  contenido: string;
}

export interface DemoParadigmaDto {
  id: 'imperativo' | 'oop' | 'funcional' | 'logico' | 'declarativo';
  nombre: string;
  cumple: string[];
  usadoEn: string[];
  bloques: DemoBloque[];
}

export interface MedicionDto {
  paradigma: string;
  etiqueta: string;
  operaciones: number;
  ms: number;
  msPorOperacion: number;
  nota: string | null;
}

export interface RendimientoDto {
  node: string;
  fecha: string;
  mediciones: MedicionDto[];
}

export interface ImagenProductoDto {
  url: string;
  urlGrande: string | null;
  fotografo: string | null;
  fotografoUrl: string | null;
  paginaUrl: string | null;
}

export interface MensajeBaristaDto {
  rol: 'cliente' | 'barista';
  texto: string;
}

export interface BaristaSugerenciaDto {
  productoId: number;
  nombre: string;
  categoria: string | null;
  precio: number;
  motivo: string;
  imagen: ImagenProductoDto | null;
}

export interface BaristaRespuestaDto {
  respuesta: string;
  sugerencias: BaristaSugerenciaDto[];
}