import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { egresosApi } from '../../services/endpoints';
import type { ConceptoEgreso } from '../../types/domain';
import { formatMoney } from '../../utils/money';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';

const conceptos: ConceptoEgreso[] = ['HIELO', 'SODA', 'TRANSPORTE', 'PROVEEDOR', 'OTRO'];

export function EgresosPage() {
  const queryClient = useQueryClient();
  const egresosQuery = useQuery({ queryKey: ['egresos'], queryFn: egresosApi.list });
  const [concepto, setConcepto] = useState<ConceptoEgreso>('HIELO');
  const [detalle, setDetalle] = useState('');
  const [monto, setMonto] = useState(0);
  const mutation = useMutation({
    mutationFn: egresosApi.create,
    onSuccess: async () => {
      setDetalle('');
      setMonto(0);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['egresos'] }),
        queryClient.invalidateQueries({ queryKey: ['caja-activa'] }),
      ]);
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate({ concepto, detalle, monto });
  }

  return (
    <div className="grid grid-cols-[420px_1fr] gap-5">
      <Card className="p-5">
        <h1 className="text-2xl font-extrabold text-slate-950">Registrar Egreso</h1>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-slate-700">
            Concepto
            <Select className="mt-2" value={concepto} onChange={(event) => setConcepto(event.target.value as ConceptoEgreso)}>
              {conceptos.map((item) => <option key={item} value={item}>{item}</option>)}
            </Select>
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Detalle
            <Input className="mt-2" value={detalle} onChange={(event) => setDetalle(event.target.value)} required />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Monto
            <Input className="mt-2" type="number" min="0.01" step="0.01" value={monto} onChange={(event) => setMonto(Number(event.target.value))} required />
          </label>
          <Button className="w-full" disabled={mutation.isPending || !detalle.trim() || monto <= 0}>Guardar egreso</Button>
        </form>
      </Card>
      <Card className="p-5">
        <h2 className="text-xl font-extrabold text-slate-950">Egresos del turno</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {egresosQuery.data?.map((egreso) => (
            <div key={egreso.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-semibold text-slate-900">{egreso.concepto}</p>
                <p className="text-sm text-slate-500">{egreso.detalle}</p>
              </div>
              <p className="font-extrabold text-red-600">-{formatMoney(egreso.monto)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
