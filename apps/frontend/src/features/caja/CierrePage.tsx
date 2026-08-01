import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { cajaApi } from '../../services/endpoints';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { formatMoney } from '../../utils/money';

export function CierrePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const cajaQuery = useQuery({ queryKey: ['caja-activa'], queryFn: cajaApi.activo });
  const [cajaReal, setCajaReal] = useState(0);
  const [notas, setNotas] = useState('');
  const diferencia = useMemo(() => cajaReal - Number(cajaQuery.data?.cajaEsperada ?? 0), [cajaReal, cajaQuery.data?.cajaEsperada]);

  const cerrarMutation = useMutation({
    mutationFn: cajaApi.cerrar,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['caja-activa'] });
      navigate('/apertura');
    },
  });

  if (!cajaQuery.data) {
    return <Card className="p-6 text-sm font-semibold text-slate-600">No hay caja abierta.</Card>;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!window.confirm('Estas seguro de cerrar la caja? Esta accion no se puede deshacer.')) return;
    cerrarMutation.mutate({ cajaReal, notas });
  }

  const caja = cajaQuery.data;
  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950">Cierre de Caja</h1>
          <p className="text-sm text-slate-500">Resumen del turno actual</p>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {[
          ['Monto inicial', caja.totalInicial],
          ['Ventas efectivo', caja.totalVentasEfectivo],
          ['Ventas QR', caja.totalVentasQr],
          ['Transferencias', caja.totalVentasTransf],
          ['Egresos', caja.totalEgresos],
        ].map(([label, value]) => (
          <Card key={label} className="p-4">
            <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
            <p className="mt-2 text-xl font-extrabold text-slate-950">{formatMoney(value)}</p>
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <p className="text-sm font-bold uppercase text-slate-500">Saldo en efectivo esperado en caja</p>
        <p className="mt-2 text-4xl font-extrabold text-slate-950">{formatMoney(caja.cajaEsperada)}</p>
        <div className="mt-6 grid gap-4">
          <label className="block text-sm font-semibold text-slate-700">
            Dinero fisico real en caja
            <Input className="mt-2" type="number" min="0" step="0.01" value={cajaReal} onChange={(event) => setCajaReal(Number(event.target.value))} />
          </label>
          <div className={diferencia === 0 ? 'text-emerald-700' : diferencia < 0 ? 'text-red-700' : 'text-amber-700'}>
            <p className="text-sm font-semibold">Diferencia calculada</p>
            <p className="text-2xl font-extrabold">{formatMoney(diferencia)} {diferencia < 0 ? '(Faltante)' : diferencia > 0 ? '(Sobrante)' : '(Cuadre perfecto)'}</p>
          </div>
          <label className="block text-sm font-semibold text-slate-700">
            Notas / Justificacion
            <textarea
              className="mt-2 min-h-28 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
              value={notas}
              onChange={(event) => setNotas(event.target.value)}
              required={diferencia !== 0}
            />
          </label>
          <Button variant="danger" disabled={cerrarMutation.isPending || (diferencia !== 0 && !notas.trim())}>Confirmar y cerrar turno</Button>
        </div>
      </Card>
    </form>
  );
}
