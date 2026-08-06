import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowRightLeft, Coins, LogOut, Wallet } from 'lucide-react';
import { authApi, cajaApi } from '../../services/endpoints';
import { useAuthStore } from '../../stores/auth-store';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { formatMoney } from '../../utils/money';

export function AperturaPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [billetes, setBilletes] = useState<number | ''>(0);
  const [monedas, setMonedas] = useState<number | ''>(0);
  const [entregadoPor, setEntregadoPor] = useState('');
  const [recibidoPor, setRecibidoPor] = useState(user?.name ?? '');

  const cajaQuery = useQuery({ queryKey: ['caja-activa'], queryFn: cajaApi.activo });
  const ultimoCierreQuery = useQuery({ queryKey: ['ultimo-cierre'], queryFn: cajaApi.ultimoCierre });
  const usersQuery = useQuery({ queryKey: ['users'], queryFn: authApi.users });

  const numBilletes = Number(billetes) || 0;
  const numMonedas = Number(monedas) || 0;
  const totalCalculado = useMemo(() => numBilletes + numMonedas, [numBilletes, numMonedas]);

  // Monto del cierre anterior si existe
  const montoCierreAnterior = Number(ultimoCierreQuery.data?.cajaReal ?? 0);
  const tieneCierreAnterior = !!ultimoCierreQuery.data;
  const diferenciaCuadre = useMemo(() => totalCalculado - montoCierreAnterior, [totalCalculado, montoCierreAnterior]);

  useEffect(() => {
    if (cajaQuery.data) {
      navigate('/pos');
    }
  }, [cajaQuery.data, navigate]);

  useEffect(() => {
    if (ultimoCierreQuery.data) {
      const saliente = ultimoCierreQuery.data.userCierre?.name || ultimoCierreQuery.data.recibidoPor;
      if (saliente && !entregadoPor) {
        setEntregadoPor(saliente);
      }
    }
  }, [ultimoCierreQuery.data, entregadoPor]);

  useEffect(() => {
    if (user?.name && !recibidoPor) {
      setRecibidoPor(user.name);
    }
  }, [user?.name, recibidoPor]);

  const abrirMutation = useMutation({
    mutationFn: cajaApi.abrir,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['caja-activa'] });
      navigate('/pos');
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    abrirMutation.mutate({
      totalBilletesInicial: numBilletes,
      totalMonedasInicial: numMonedas,
      entregadoPor,
      recibidoPor: recibidoPor || user?.name || 'Cajero',
    });
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-2xl p-6 sm:p-8 shadow-md border-slate-200">
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Licorería La Ruta</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">Apertura de Caja</h1>
          <p className="mt-0.5 text-xs text-slate-500 font-medium">{new Date().toLocaleDateString('es-BO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Tarjeta del Último Cierre Registrado */}
        {tieneCierreAnterior && (
          <div className="mb-6 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                  <ArrowRightLeft className="h-3.5 w-3.5" /> Turno Anterior Cerrado
                </span>
                <p className="text-xs text-slate-600 mt-0.5">
                  Cerrado por: <strong className="text-slate-900">{ultimoCierreQuery.data?.userCierre?.name || ultimoCierreQuery.data?.recibidoPor}</strong>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400">Monto dejado en caja</p>
                <p className="text-lg font-black text-indigo-950">{formatMoney(montoCierreAnterior)}</p>
              </div>
            </div>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              <span className="flex items-center gap-1.5 mb-1.5">
                <Wallet className="h-4 w-4 text-brand-600" /> Billetes Iniciales (Bs.)
              </span>
              <Input
                className="h-10 text-sm font-bold"
                type="number"
                min="0"
                step="0.1"
                placeholder="0.00"
                value={billetes}
                onChange={(event) => setBilletes(event.target.value === '' ? '' : Number(event.target.value))}
                onFocus={(e) => e.target.select()}
                required
              />
            </label>

            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              <span className="flex items-center gap-1.5 mb-1.5">
                <Coins className="h-4 w-4 text-brand-600" /> Monedas Iniciales (Bs.)
              </span>
              <Input
                className="h-10 text-sm font-bold"
                type="number"
                min="0"
                step="0.1"
                placeholder="0.00"
                value={monedas}
                onChange={(event) => setMonedas(event.target.value === '' ? '' : Number(event.target.value))}
                onFocus={(e) => e.target.select()}
                required
              />
            </label>
          </div>

          {/* Caja con Total Inicial y Verificación de Cuadre */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Monto Total de Apertura Ingresado</p>
            <p className="mt-0.5 text-3xl font-black text-slate-900">{formatMoney(totalCalculado)}</p>

            {tieneCierreAnterior && (
              <div className={`mt-2 pt-2 border-t border-slate-200/80 text-xs font-bold ${
                diferenciaCuadre === 0 
                  ? 'text-emerald-700' 
                  : diferenciaCuadre < 0 
                  ? 'text-red-700' 
                  : 'text-amber-700'
              }`}>
                {diferenciaCuadre === 0 ? (
                  <span>✅ Cuadra perfectamente con el cierre anterior ({formatMoney(montoCierreAnterior)})</span>
                ) : diferenciaCuadre < 0 ? (
                  <span>⚠️ Diferencia: {formatMoney(diferenciaCuadre)} (Faltante vs. cierre anterior de {formatMoney(montoCierreAnterior)})</span>
                ) : (
                  <span>⚠️ Diferencia: +{formatMoney(diferenciaCuadre)} (Sobrante vs. cierre anterior de {formatMoney(montoCierreAnterior)})</span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              De quién recibe turno <span className="text-red-500">*</span>
              <Select
                className="mt-1.5 h-10 text-sm font-semibold"
                value={entregadoPor}
                onChange={(event) => setEntregadoPor(event.target.value)}
                required
              >
                <option value="">Seleccionar quien entrega...</option>
                {usersQuery.data?.map((u) => (
                  <option key={u.id} value={u.name}>{u.name} ({u.email})</option>
                ))}
              </Select>
            </label>

            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Recibido por (Cajero entrante) <span className="text-red-500">*</span>
              <Input
                className="mt-1.5 h-10 text-sm font-semibold bg-slate-100"
                value={recibidoPor}
                onChange={(event) => setRecibidoPor(event.target.value)}
                required
              />
            </label>
          </div>

          {abrirMutation.error ? (
            <p className="rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-700 border border-red-200">
              {(abrirMutation.error as any)?.response?.data?.message || 'No se pudo abrir la caja'}
            </p>
          ) : null}

          <div className="pt-2 flex flex-col gap-2">
            <Button className="w-full h-11 text-sm font-bold shadow-md bg-brand-600 hover:bg-brand-500 text-white" disabled={abrirMutation.isPending || totalCalculado < 0 || !entregadoPor}>
              {abrirMutation.isPending ? 'Abriendo caja...' : 'Confirmar y abrir caja'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full h-9 text-xs font-bold text-slate-500 hover:text-slate-700 gap-1.5"
              onClick={() => {
                localStorage.removeItem('dev-token');
                window.location.href = '/login';
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Cerrar sesión</span>
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
}
