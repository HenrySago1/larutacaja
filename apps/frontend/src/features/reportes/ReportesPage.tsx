import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, AlertTriangle, Clock, DollarSign, CreditCard, Smartphone } from 'lucide-react';
import { cajaApi, reportesApi } from '../../services/endpoints';
import { formatMoney } from '../../utils/money';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { CajaDetalleModal } from './CajaDetalleModal';

export function ReportesPage() {
  const [selectedCajaId, setSelectedCajaId] = useState<string | null>(null);

  const resumenQuery = useQuery({ queryKey: ['resumen-dia'], queryFn: () => reportesApi.resumenDia() });
  const historialQuery = useQuery({ queryKey: ['caja-historial'], queryFn: cajaApi.historial });

  const stats = useMemo(() => {
    const ventas = resumenQuery.data?.ventas ?? [];
    const egresos = resumenQuery.data?.egresos ?? [];

    const ventasEfectivo = ventas.filter((v) => v.tipoPago === 'EFECTIVO').reduce((acc, v) => acc + Number(v.total), 0);
    const ventasQr = ventas.filter((v) => v.tipoPago === 'QR').reduce((acc, v) => acc + Number(v.total), 0);
    const ventasTransf = ventas.filter((v) => v.tipoPago === 'TRANSFERENCIA').reduce((acc, v) => acc + Number(v.total), 0);
    const ventasTotal = ventasEfectivo + ventasQr + ventasTransf;
    const egresosTotal = egresos.reduce((acc, e) => acc + Number(e.monto), 0);
    const utilidad = ventasTotal - egresosTotal;

    // Top impulsadoras
    const impulsadoraMap = new Map<string, { nombre: string; total: number; count: number }>();
    for (const venta of ventas) {
      const nombre = venta.impulsadora?.nombre ?? 'Cajero Directo';
      const existing = impulsadoraMap.get(nombre) ?? { nombre, total: 0, count: 0 };
      existing.total += Number(venta.total);
      existing.count += 1;
      impulsadoraMap.set(nombre, existing);
    }
    const topImpulsadoras = [...impulsadoraMap.values()].sort((a, b) => b.total - a.total).slice(0, 5);

    return { ventasEfectivo, ventasQr, ventasTransf, ventasTotal, egresosTotal, utilidad, ventasCount: ventas.length, topImpulsadoras };
  }, [resumenQuery.data]);

  const maxVentaPago = Math.max(stats.ventasEfectivo, stats.ventasQr, stats.ventasTransf, 1);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-950">Dashboard &amp; Reportes</h1>
        <p className="text-sm text-slate-500">Resumen del dia, rendimiento y auditoria de cierres</p>
      </div>

      {/* Cards principales */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Ventas del dia</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-950">{formatMoney(stats.ventasTotal)}</p>
              <p className="text-xs text-slate-500">{stats.ventasCount} transacciones</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-red-50 text-red-600">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Egresos del dia</p>
              <p className="mt-1 text-2xl font-extrabold text-red-600">{formatMoney(stats.egresosTotal)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Utilidad estimada</p>
              <p className={`mt-1 text-2xl font-extrabold ${stats.utilidad >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatMoney(stats.utilidad)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">Productos bajos</p>
              <p className="mt-1 text-2xl font-extrabold text-amber-600">{resumenQuery.data?.bajoStock.length ?? 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Grafico + Top impulsadoras */}
      <div className="grid grid-cols-2 gap-5">
        {/* Grafico de barras por tipo de pago */}
        <Card className="p-5">
          <h2 className="text-sm font-extrabold uppercase text-slate-500">Ventas por tipo de pago</h2>
          <div className="mt-5 space-y-4">
            {[
              { label: 'Efectivo', value: stats.ventasEfectivo, color: 'bg-emerald-500', icon: DollarSign },
              { label: 'QR', value: stats.ventasQr, color: 'bg-indigo-500', icon: Smartphone },
              { label: 'Transferencia', value: stats.ventasTransf, color: 'bg-violet-500', icon: CreditCard },
            ].map((item) => {
              const pct = maxVentaPago > 0 ? (item.value / maxVentaPago) * 100 : 0;
              return (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-semibold text-slate-700">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    <span className="font-extrabold text-slate-950">{formatMoney(item.value)}</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-700 ease-out`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-5 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-slate-500">TOTAL VENTAS</span>
              <span className="text-xl font-extrabold text-slate-950">{formatMoney(stats.ventasTotal)}</span>
            </div>
          </div>
        </Card>

        {/* Top impulsadoras */}
        <Card className="p-5">
          <h2 className="text-sm font-extrabold uppercase text-slate-500">Top impulsadoras del dia</h2>
          {stats.topImpulsadoras.length === 0 ? (
            <p className="mt-5 text-sm text-slate-500">Sin ventas registradas hoy</p>
          ) : (
            <div className="mt-5 space-y-3">
              {stats.topImpulsadoras.map((imp, index) => {
                const maxTotal = stats.topImpulsadoras[0]?.total ?? 1;
                const pct = (imp.total / maxTotal) * 100;
                return (
                  <div key={imp.nombre}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-700">
                        <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                          {index + 1}
                        </span>
                        {imp.nombre}
                      </span>
                      <span className="font-extrabold text-slate-950">{formatMoney(imp.total)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-brand-600 transition-all duration-700 ease-out"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-500">{imp.count} ventas</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Historial de cierres */}
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-slate-400" />
          <h2 className="text-lg font-extrabold text-slate-950">Historial de cierres</h2>
        </div>
        <p className="mt-1 text-xs text-slate-500">Haz clic en una fila para ver el detalle completo</p>
        <div className="mt-4 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3">Apertura</th>
                <th>Cierre</th>
                <th>Inicial</th>
                <th>Esperada</th>
                <th>Real</th>
                <th>Diferencia</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {historialQuery.data?.map((caja) => (
                <tr
                  key={caja.id}
                  className="cursor-pointer border-b border-slate-100 transition hover:bg-indigo-50/50"
                  onClick={() => setSelectedCajaId(caja.id)}
                >
                  <td className="py-3">{new Date(caja.fechaApertura).toLocaleString('es-BO')}</td>
                  <td>{caja.fechaCierre ? new Date(caja.fechaCierre).toLocaleString('es-BO') : '-'}</td>
                  <td>{formatMoney(caja.totalInicial)}</td>
                  <td>{formatMoney(caja.cajaEsperada)}</td>
                  <td>{formatMoney(caja.cajaReal)}</td>
                  <td className={`font-bold ${Number(caja.diferencia ?? 0) < 0 ? 'text-red-600' : Number(caja.diferencia ?? 0) > 0 ? 'text-amber-600' : ''}`}>
                    {formatMoney(caja.diferencia)}
                  </td>
                  <td><Badge tone={caja.estado === 'ABIERTO' ? 'green' : 'slate'}>{caja.estado}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Alertas stock */}
      {(resumenQuery.data?.bajoStock.length ?? 0) > 0 ? (
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-extrabold text-slate-950">Alertas de stock minimo</h2>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {resumenQuery.data?.bajoStock.map((producto) => (
              <div key={producto.id} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="font-bold text-amber-950">{producto.nombre}</p>
                <p className="text-sm text-amber-700">
                  Stock <span className="font-bold">{producto.stock}</span> / minimo {producto.stockMinimo}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Modal de detalle */}
      <CajaDetalleModal cajaId={selectedCajaId} onClose={() => setSelectedCajaId(null)} />
    </div>
  );
}
