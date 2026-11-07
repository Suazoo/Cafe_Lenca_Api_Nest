import type { PedidoHistorialDto } from '@cafe-lenca/shared';
import { fechaHora, lempiras } from '../../lib/format';

function Linea({
  izq,
  der,
  fuerte = false,
  clase = '',
}: {
  izq: string;
  der: string;
  fuerte?: boolean;
  clase?: string;
}) {
  return (
    <div className={`flex justify-between gap-3 ${fuerte ? 'text-base font-bold' : ''} ${clase}`}>
      <span className="min-w-0 break-words">{izq}</span>
      <span className="shrink-0">{der}</span>
    </div>
  );
}

const Separador = () => <hr className="my-3 border-dashed border-border" />;

export default function Ticket({ pedido }: { pedido: PedidoHistorialDto }) {
  const pie = [
    pedido.metodoPago ? `Pagado con ${pedido.metodoPago}` : null,
    pedido.mesaNumero !== null ? `Mesa ${pedido.mesaNumero}` : null,
  ]
    .filter((x): x is string => x !== null)
    .join(' · ');

  return (
    <div className="ticket relative mx-auto mb-2 w-full max-w-sm border border-b-0 border-border bg-surface px-5 pb-5 pt-6 font-mono text-[13px] leading-relaxed">
      <p className="text-center font-display text-lg font-bold tracking-wide">CAFÉ LENCA</p>
      <p className="text-center text-xs text-muted">
        {pedido.numeroFactura ? `Factura ${pedido.numeroFactura}` : `Pedido #${pedido.idPedido}`}
      </p>
      {pedido.fecha && <p className="text-center text-xs capitalize text-muted">{fechaHora(pedido.fecha)}</p>}

      <Separador />
      <div className="space-y-1">
        {pedido.lineas.map((l) => (
          <Linea key={l.productoId} izq={`${l.cantidad} × ${l.nombre}`} der={lempiras(l.importe)} />
        ))}
      </div>

      <Separador />
      <div className="space-y-0.5">
        <Linea izq="Subtotal" der={lempiras(pedido.subtotal)} />
        {pedido.descuento > 0 && (
          <Linea izq="Descuento" der={`-${lempiras(pedido.descuento)}`} clase="text-accent" />
        )}
        <Linea izq="ISV" der={lempiras(pedido.impuesto)} />
      </div>

      <Separador />
      <Linea izq="TOTAL" der={lempiras(pedido.total)} fuerte />

      <Separador />
      {pie && <p className="text-center text-xs text-muted">{pie}</p>}
      <p className="mt-2 text-center text-xs">¡Gracias por tu visita!</p>
    </div>
  );
}