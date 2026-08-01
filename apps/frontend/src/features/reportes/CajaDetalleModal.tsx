import { useQuery } from '@tanstack/react-query';
import { reportesApi } from '../../services/endpoints';
import { formatMoney } from '../../utils/money';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { Modal } from '../../components/ui/modal';

type Props = {
  cajaId: string | null;
  onClose: () => void;
};

export function CajaDetalleModal({ cajaId, onClose }: Props) {
  const query = useQuery({
    queryKey: ['caja-detalle', cajaId],
    queryFn: () => reportesApi.detalleCaja(cajaId!),
    enabled: !!cajaId,
  });

  const caja = query.data;

  return (
    <Modal open={!!cajaId} onClose={onClose} title="Detalle de Cierre de Caja" wide>
      {query.isLoading ? (
        <p className="text-sm text-slate-500">Cargando detalle...</p>
      ) : !caja ? (
        <p className="text-sm text-red-600">No se encontro la caja</p>
      ) : (
        <div className="space-y-6">
          {/* Info general */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-bold text-slate-500">Abierta por</p>
              <p className="font-semibold text-slate-900">{caja.userApertura.name}</p>
              <p className="text-xs text-slate-500">{new Date(caja.fechaApertura).toLocaleString('es-BO')}</p>
            </div>
            <div>
              <p className="font-bold text-slate-500">Cerrada por</p>
              <p className="font-semibold text-slate-900">{caja.userCierre?.name ?? '-'}</p>
              <p className="text-xs text-slate-500">{caja.fechaCierre ? new Date(caja.fechaCierre).toLocaleString('es-BO') : '-'}</p>
            </div>
          </div>

          {/* Resumen financiero */}
          <div className="grid grid-cols-5 gap-3">
            {[
              ['Monto inicial', caja.totalInicial, 'slate'],
              ['Ventas efectivo', caja.totalVentasEfectivo, 'green'],
              ['Ventas QR', caja.totalVentasQr, 'indigo'],
              ['Transferencias', caja.totalVentasTransf, 'indigo'],
              ['Egresos', caja.totalEgresos, 'red'],
            ].map(([label, value, tone]) => (
              <Card key={label as string} className="p-3">
                <p className="text-xs font-bold uppercase text-slate-500">{label as string}</p>
                <p className={`mt-1 text-lg font-extrabold ${tone === 'red' ? 'text-red-600' : tone === 'green' ? 'text-emerald-600' : 'text-slate-950'}`}>
                  {formatMoney(value as string)}
                </p>
              </Card>
            ))}
          </div>

          {/* Cuadre */}
          <Card className="p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Caja esperada</p>
                <p className="mt-1 text-xl font-extrabold text-slate-950">{formatMoney(caja.cajaEsperada)}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Caja real</p>
                <p className="mt-1 text-xl font-extrabold text-slate-950">{formatMoney(caja.cajaReal)}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-500">Diferencia</p>
                <p className={`mt-1 text-xl font-extrabold ${Number(caja.diferencia ?? 0) === 0 ? 'text-emerald-600' : Number(caja.diferencia ?? 0) < 0 ? 'text-red-600' : 'text-amber-600'}`}>
                  {formatMoney(caja.diferencia)} {Number(caja.diferencia ?? 0) < 0 ? '(Faltante)' : Number(caja.diferencia ?? 0) > 0 ? '(Sobrante)' : ''}
                </p>
              </div>
            </div>
            {caja.notas ? (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-bold uppercase text-amber-700">Notas del cajero</p>
                <p className="mt-1 text-sm text-amber-900">{caja.notas}</p>
              </div>
            ) : null}
          </Card>

          {/* Ventas del turno */}
          <div>
            <h3 className="text-sm font-extrabold uppercase text-slate-500">Ventas del turno ({caja.ventasAsociadas.length})</h3>
            <div className="mt-3 max-h-60 overflow-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="py-2">Hora</th>
                    <th>Productos</th>
                    <th>Impulsadora</th>
                    <th>Pago</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {caja.ventasAsociadas.map((venta) => (
                    <tr key={venta.id} className="border-b border-slate-100">
                      <td className="py-2 text-slate-600">{new Date(venta.createdAt).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="text-slate-900">
                        {venta.detalles.map((d) => `${d.cantidad}x ${d.producto.nombre}`).join(', ')}
                      </td>
                      <td className="text-slate-600">{venta.impulsadora?.nombre ?? 'Directo'}</td>
                      <td><Badge tone={venta.tipoPago === 'EFECTIVO' ? 'green' : venta.tipoPago === 'QR' ? 'indigo' : 'slate'}>{venta.tipoPago}</Badge></td>
                      <td className="text-right font-bold text-slate-900">{formatMoney(venta.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Egresos del turno */}
          <div>
            <h3 className="text-sm font-extrabold uppercase text-slate-500">Egresos del turno ({caja.egresosAsociados.length})</h3>
            <div className="mt-3 max-h-40 overflow-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="py-2">Concepto</th>
                    <th>Detalle</th>
                    <th className="text-right">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {caja.egresosAsociados.map((egreso) => (
                    <tr key={egreso.id} className="border-b border-slate-100">
                      <td className="py-2 font-semibold text-slate-900">{egreso.concepto}</td>
                      <td className="text-slate-600">{egreso.detalle}</td>
                      <td className="text-right font-bold text-red-600">-{formatMoney(egreso.monto)}</td>
                    </tr>
                  ))}
                  {caja.egresosAsociados.length === 0 ? (
                    <tr><td colSpan={3} className="py-3 text-slate-500">Sin egresos en este turno</td></tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
