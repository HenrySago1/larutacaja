import { FormEvent, useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import { auth } from '../../config/firebase';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (email === 'admin@laruta.com' && password === 'admin') {
        localStorage.setItem('dev-token', 'admin-token');
        // Usamos window.location.href para forzar el reinicio de la app y que lea el nuevo token
        window.location.href = '/pos';
      } else {
        setError('Usa admin@laruta.com / admin para ingresar');
      }
    } catch {
      setError('Correo o contrasena invalidos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-lg bg-indigo-50 text-brand-600">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-950">La Ruta</h1>
          <p className="mt-1 text-sm text-slate-500">Ingreso al sistema de caja</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input type="email" placeholder="correo@laruta.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Input type="password" placeholder="Contrasena" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}
          <Button className="w-full" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
      </Card>
    </main>
  );
}
