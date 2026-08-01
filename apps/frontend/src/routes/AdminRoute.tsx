import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/auth-store';

export function AdminRoute() {
  const user = useAuthStore((state) => state.user);
  return user?.role === 'ADMIN' ? <Outlet /> : <Navigate to="/pos" replace />;
}
