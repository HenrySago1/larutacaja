import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, UserPlus, Users } from 'lucide-react';
import { authApi } from '../../services/endpoints';
import type { User } from '../../types/domain';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Modal } from '../../components/ui/modal';

export function UsuariosPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // Editing state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');

  const usersQuery = useQuery({ queryKey: ['users'], queryFn: authApi.users });

  const createMutation = useMutation({
    mutationFn: authApi.registerCajero,
    onSuccess: async () => {
      setName('');
      setEmail('');
      setPassword('');
      setMessage('Cajero creado con éxito');
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => setMessage(error.response?.data?.message || 'No se pudo crear el cajero'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; email?: string; password?: string } }) =>
      authApi.updateUser(id, payload),
    onSuccess: async () => {
      setEditingUser(null);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Error al actualizar el usuario');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: authApi.deleteUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Error al eliminar el usuario');
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    createMutation.mutate({ name, email, password });
  }

  function openEditModal(user: User) {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPassword('');
  }

  function handleUpdateSubmit(event: FormEvent) {
    event.preventDefault();
    if (!editingUser) return;
    updateMutation.mutate({
      id: editingUser.id,
      payload: {
        name: editName,
        email: editEmail,
        ...(editPassword ? { password: editPassword } : {}),
      },
    });
  }

  function handleDelete(user: User) {
    if (confirm(`¿Seguro que deseas eliminar al cajero "${user.name}"?`)) {
      deleteMutation.mutate(user.id);
    }
  }

  return (
    <div className="grid max-w-6xl grid-cols-1 items-start gap-6 lg:grid-cols-12">
      {/* Formulario de Creación */}
      <Card className="p-6 lg:col-span-5 shadow-sm border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 leading-tight">Gestión de Cajeros</h1>
            <p className="text-xs text-slate-400">Crea nuevos usuarios en el sistema.</p>
          </div>
        </div>

        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Nombre Completo</label>
            <Input placeholder="Ej. Juan Pérez" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Correo Electrónico</label>
            <Input type="email" placeholder="cajero@laruta.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Contraseña Temporal</label>
            <Input type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} />
          </div>

          {message ? (
            <p className={`rounded-lg px-3 py-2 text-xs font-semibold ${createMutation.isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
              {message}
            </p>
          ) : null}

          <Button className="w-full h-10 text-xs font-bold bg-brand-600 text-white hover:bg-brand-500" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Guardando...' : 'Crear Cajero'}
          </Button>
        </form>
      </Card>
      
      {/* Lista de Usuarios Registrados */}
      <Card className="p-6 lg:col-span-7 shadow-sm border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-brand-600" />
            <h2 className="text-base font-extrabold text-slate-900">Usuarios Registrados</h2>
          </div>
          <Badge tone="indigo" className="text-xs font-bold">
            {usersQuery.data?.length ?? 0} usuarios
          </Badge>
        </div>

        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1">
          {usersQuery.data?.map((user) => (
            <div key={user.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 rounded-lg px-2 transition">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900 text-sm truncate">{user.name}</p>
                  <Badge tone={user.role === 'ADMIN' ? 'red' : 'indigo'} className="text-[10px] uppercase font-bold">
                    {user.role}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
              </div>

              {/* Botones de Edición y Eliminación */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="secondary"
                  className="h-8 w-8 p-0 flex items-center justify-center text-slate-600 hover:text-brand-600"
                  onClick={() => openEditModal(user)}
                  title="Editar usuario"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                {user.role !== 'ADMIN' && (
                  <Button
                    variant="secondary"
                    className="h-8 w-8 p-0 flex items-center justify-center text-slate-600 hover:text-red-600 hover:border-red-200"
                    onClick={() => handleDelete(user)}
                    title="Eliminar cajero"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {usersQuery.data?.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-6">No hay usuarios registrados.</p>
          )}
        </div>
      </Card>

      {/* Modal para Editar Cajero */}
      {editingUser && (
        <Modal open={!!editingUser} onClose={() => setEditingUser(null)} title="Editar Usuario">
          <form className="space-y-4" onSubmit={handleUpdateSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Nombre Completo</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Correo Electrónico</label>
              <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Nueva Contraseña (Opcional)</label>
              <Input
                type="password"
                placeholder="Dejar en blanco para conservar la actual"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                minLength={8}
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" type="button" className="h-9 px-4 text-xs font-bold" onClick={() => setEditingUser(null)}>
                Cancelar
              </Button>
              <Button className="h-9 px-4 text-xs font-bold bg-brand-600 text-white hover:bg-brand-500" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
