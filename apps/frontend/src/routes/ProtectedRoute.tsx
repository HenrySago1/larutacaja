import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/auth-store';

export function ProtectedRoute() {
  const { ready, user } = useAuthStore();

  if (!ready) {
    return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-slate-600">Cargando sesion...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
