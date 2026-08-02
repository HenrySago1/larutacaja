import { FormEvent, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriasApi } from '../../services/endpoints';
import type { Categoria } from '../../types/domain';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

interface CategoriasModalProps {
  categorias: Categoria[];
  onClose: () => void;
}

export function CategoriasModal({ categorias, onClose }: CategoriasModalProps) {
  const queryClient = useQueryClient();
  const [nombre, setNombre] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: categoriasApi.create,
    onSuccess: async () => {
      setNombre('');
      await queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (params: { id: string; nombre: string }) => categoriasApi.update(params.id, { nombre: params.nombre }),
    onSuccess: async () => {
      setNombre('');
      setEditingId(null);
      await queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoriasApi.delete,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, nombre });
    } else {
      createMutation.mutate({ nombre });
    }
  }

  function edit(categoria: Categoria) {
    setEditingId(categoria.id);
    setNombre(categoria.nombre);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-950">Gestionar Categorias</h2>
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
        </div>

        <form onSubmit={handleSubmit} className="mb-6 flex gap-3">
          <Input placeholder="Nombre de la categoria" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          <Button disabled={createMutation.isPending || updateMutation.isPending}>
            {editingId ? 'Guardar' : 'Crear'}
          </Button>
          {editingId && <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setNombre(''); }}>X</Button>}
        </form>

        <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
          {categorias.map((categoria) => (
            <div key={categoria.id} className="flex items-center justify-between py-2">
              <p className="font-semibold text-slate-700">{categoria.nombre}</p>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => edit(categoria)}>Editar</Button>
                <Button variant="secondary" onClick={() => {
                  if (confirm('Seguro que deseas eliminar esta categoria?')) {
                    deleteMutation.mutate(categoria.id);
                  }
                }}>Borrar</Button>
              </div>
            </div>
          ))}
          {categorias.length === 0 && <p className="text-center text-sm text-slate-500 py-4">No hay categorias registradas</p>}
        </div>
      </div>
    </div>
  );
}
