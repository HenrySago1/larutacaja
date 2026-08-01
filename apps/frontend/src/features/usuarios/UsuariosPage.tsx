import { FormEvent, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../services/endpoints';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

export function UsuariosPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const mutation = useMutation({
    mutationFn: authApi.registerCajero,
    onSuccess: () => {
      setName('');
      setEmail('');
      setPassword('');
      setMessage('Cajero creado con exito');
    },
    onError: () => setMessage('No se pudo crear el cajero'),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage('');
    mutation.mutate({ name, email, password });
  }

  return (
    <div className="max-w-xl">
      <Card className="p-5">
        <h1 className="text-2xl font-extrabold text-slate-950">Gestion de Cajeros</h1>
        <p className="mt-1 text-sm text-slate-500">Crea usuarios operativos en Firebase Authentication y la base local.</p>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <Input placeholder="Nombre completo" value={name} onChange={(event) => setName(event.target.value)} required />
          <Input type="email" placeholder="correo@laruta.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Input type="password" placeholder="Contrasena temporal" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} />
          {message ? <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">{message}</p> : null}
          <Button disabled={mutation.isPending}>Crear cajero</Button>
        </form>
      </Card>
    </div>
  );
}
