import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { impulsadorasApi } from '../../services/endpoints';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

export function ImpulsadorasPage() {
  const queryClient = useQueryClient();
  const [nombre, setNombre] = useState('');
  const impulsadorasQuery = useQuery({ queryKey: ['impulsadoras'], queryFn: impulsadorasApi.list });
  const createMutation = useMutation({
    mutationFn: impulsadorasApi.create,
    onSuccess: async () => {
      setNombre('');
      await queryClient.invalidateQueries({ queryKey: ['impulsadoras'] });
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => impulsadorasApi.update(id, { isActive }),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: ['impulsadoras'] }),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    createMutation.mutate({ nombre });
  }

  return (
    <div className="grid max-w-4xl grid-cols-[360px_1fr] gap-5">
      <Card className="p-5">
        <h1 className="text-2xl font-extrabold text-slate-950">Impulsadoras</h1>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <Input placeholder="Nombre" value={nombre} onChange={(event) => setNombre(event.target.value)} required />
          <Button disabled={createMutation.isPending || !nombre.trim()}>Crear impulsadora</Button>
        </form>
      </Card>
      <Card className="p-5">
        <h2 className="text-lg font-extrabold text-slate-950">Activas</h2>
        <div className="mt-4 divide-y divide-slate-100">
          {impulsadorasQuery.data?.map((impulsadora) => (
            <div key={impulsadora.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-semibold text-slate-950">{impulsadora.nombre}</p>
                <Badge tone="green">Activa</Badge>
              </div>
              <Button variant="secondary" onClick={() => updateMutation.mutate({ id: impulsadora.id, isActive: false })}>Desactivar</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
