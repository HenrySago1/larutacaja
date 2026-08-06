import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { UserCheck } from 'lucide-react';
import { auth } from '../../config/firebase';
import { authApi, cajaApi } from '../../services/endpoints';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { formatMoney } from '../../utils/money';

export function CierrePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const cajaQuery = useQuery({ queryKey: ['caja-activa'], queryFn: cajaApi.activo });
  const usersQuery = useQuery({ queryKey: ['users'], queryFn: authApi.users });
  
  const [cajaReal, setCajaReal] = useState(0);
  const [entregadoA, setEntregadoA] = useState('');
  const [notas, setNotas] = useState('');
  const diferencia = useMemo(() => cajaReal - Number(cajaQuery.data?.cajaEsperada ?? 0), [cajaReal, cajaQuery.data?.cajaEsperada]);

  const cerrarMutation = useMutation({
    mutationFn: cajaApi.cerrar,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['caja-activa'] });
      try {
        await signOut(auth);
      } catch {
        // Ignora si Firebase no está activo
      }
      localStorage.removeItem('dev-token');
      window.location.href = '/login';
    },
  });

  if (!cajaQuery.data) {
    return <Card className="p-6 text-sm font-semibold text-slate-600">No hay caja abierta.</Card>;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!window.confirm('¿Estás seguro de cerrar la caja? Esta acción no se puede deshacer.')) return;
    cerrarMutation.mutate({ cajaReal, entregadoA, notas });
  }

  const caja = cajaQuery.data;
  return (
    <form className="space-y-5 max-w-5xl mx-auto" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950">Cierre de Caja</h1>
          <p className="text-sm text-slate-500">Resumen del turno actual</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          ['Monto inicial', caja.totalInicial],
          ['Ventas efectivo', caja.totalVentasEfectivo],
          ['Ventas QR', caja.totalVentasQr],
          ['Transferencias', caja.totalVentasTransf],
          ['Egresos', caja.totalEgresos],
        ].map(([label, value]) => (
          <Card key={label as string} className="p-4 shadow-xs">
            <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
            <p className="mt-2 text-xl font-extrabold text-slate-950">{formatMoney(value)}</p>
          </Card>
        ))}
      </div>
      <Card className="p-6 shadow-sm border-slate-200">
        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Saldo en efectivo esperado en caja</p>
        <p className="mt-1 text-4xl font-black text-slate-950">{formatMoney(caja.cajaEsperada)}</p>
        
        <div className="mt-6 grid gap-5">
          <label className="block text-sm font-bold text-slate-700">
            Dinero físico real en caja <span className="text-red-500">*</span>
            <Input className="mt-1.5 h-11 text-base font-bold" type="number" min="0" step="0.01" value={cajaReal} onChange={(event) => setCajaReal(Number(event.target.value))} required />
          </label>

          <div className={`p-4 rounded-xl border ${diferencia === 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : diferencia < 0 ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
            <p className="text-xs font-extrabold uppercase tracking-wider">Diferencia calculada</p>
            <p className="text-2xl font-black mt-0.5">
              {formatMoney(diferencia)} {diferencia < 0 ? '(Faltante)' : diferencia > 0 ? '(Sobrante)' : '(Cuadre perfecto)'}
            </p>
          </div>

          <label className="block text-sm font-bold text-slate-700">
            <span className="flex items-center gap-1.5 mb-1.5">
              <UserCheck className="h-4 w-4 text-brand-600" /> Entregando turno a (Cajero entrante) <span className="text-red-500">*</span>
            </span>
            <Select className="h-10 text-sm font-semibold" value={entregadoA} onChange={(event) => setEntregadoA(event.target.value)} required>
              <option value="">Seleccionar cajero entrante...</option>
              {usersQuery.data?.map((u) => (
                <option key={u.id} value={u.name}>{u.name} ({u.email})</option>
              ))}
            </Select>
          </label>

          <label className="block text-sm font-bold text-slate-700">
            Notas / Justificación {diferencia !== 0 && <span className="text-red-500">* (Obligatorio por diferencia)</span>}
            <textarea
              className="mt-1.5 min-h-24 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 font-medium"
              placeholder="Detalla cualquier observación relevante del turno o diferencia de caja..."
              value={notas}
              onChange={(event) => setNotas(event.target.value)}
              required={diferencia !== 0}
            />
          </label>

          <Button variant="danger" className="h-12 text-sm font-bold shadow-md" disabled={cerrarMutation.isPending || !entregadoA || (diferencia !== 0 && !notas.trim())}>
            {cerrarMutation.isPending ? 'Cerrando turno...' : 'Confirmar y cerrar turno'}
          </Button>
        </div>
      </Card>
    </form>
  );
}
