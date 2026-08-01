import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { cajaApi } from '../../services/endpoints';
import { useAuthStore } from '../../stores/auth-store';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { formatMoney } from '../../utils/money';

export function AperturaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [billetes, setBilletes] = useState(0);
  const [monedas, setMonedas] = useState(0);
  const [entregadoPor, setEntregadoPor] = useState('');
  const [recibidoPor, setRecibidoPor] = useState(user?.name ?? '');
  const total = useMemo(() => billetes + monedas, [billetes, monedas]);

  const cajaQuery = useQuery({ queryKey: ['caja-activa'], queryFn: cajaApi.activo });
  const abrirMutation = useMutation({
    mutationFn: cajaApi.abrir,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['caja-activa'] });
      navigate('/pos');
    },
  });

  useEffect(() => {
    if (cajaQuery.data) {
      navigate('/pos');
    }
  }, [cajaQuery.data, navigate]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    abrirMutation.mutate({
      totalBilletesInicial: billetes,
      totalMonedasInicial: monedas,
      entregadoPor,
      recibidoPor,
    });
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <Card className="w-full max-w-2xl p-8">
        <div className="mb-8 text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-brand-600">Licoreria La Ruta</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-950">Apertura de Caja</h1>
          <p className="mt-1 text-sm text-slate-500">{new Date().toLocaleDateString('es-BO')}</p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-slate-700">
            Dinero inicial en billetes
            <Input className="mt-2" type="number" min="0" step="0.01" value={billetes} onChange={(event) => setBilletes(Number(event.target.value))} />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Dinero inicial en monedas
            <Input className="mt-2" type="number" min="0" step="0.01" value={monedas} onChange={(event) => setMonedas(Number(event.target.value))} />
          </label>
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-center">
            <p className="text-sm font-semibold text-indigo-700">Total inicial calculado</p>
            <p className="mt-1 text-3xl font-extrabold text-indigo-950">{formatMoney(total)}</p>
          </div>
          <label className="block text-sm font-semibold text-slate-700">
            Entregado por
            <Input className="mt-2" value={entregadoPor} onChange={(event) => setEntregadoPor(event.target.value)} required />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Recibido por
            <Input className="mt-2" value={recibidoPor} onChange={(event) => setRecibidoPor(event.target.value)} required />
          </label>
          {abrirMutation.error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">No se pudo abrir la caja</p> : null}
          <Button className="w-full" disabled={abrirMutation.isPending || total < 0}>
            Abrir caja
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            className="w-full" 
            onClick={() => {
              localStorage.removeItem('dev-token');
              window.location.href = '/login';
            }}
          >
            Cerrar sesión
          </Button>
        </form>
      </Card>
    </main>
  );
}
