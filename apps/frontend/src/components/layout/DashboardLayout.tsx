import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { BarChart3, Boxes, LogOut, Receipt, ShoppingCart, Sparkles, Users } from 'lucide-react';
import { auth } from '../../config/firebase';
import { useAuthStore } from '../../stores/auth-store';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const navItems = [
  { to: '/pos', label: 'POS', icon: ShoppingCart },
  { to: '/egresos', label: 'Egresos', icon: Receipt },
  { to: '/inventario', label: 'Inventario', icon: Boxes },
  { to: '/reportes', label: 'Reportes', icon: BarChart3, admin: true },
  { to: '/impulsadoras', label: 'Impulsadoras', icon: Sparkles, admin: true },
  { to: '/usuarios', label: 'Cajeros', icon: Users, admin: true },
];

export function DashboardLayout() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch {
      // ignora errores si Firebase no está inicializado
    }
    localStorage.removeItem('dev-token');
    window.location.href = '/login';
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-lg font-extrabold text-slate-950">LA RUTA</p>
              <p className="text-xs font-medium text-slate-500">Caja e Inventario</p>
            </div>
            <Badge tone="green">Sistema activo</Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.role}</p>
            </div>
            <Button variant="secondary" onClick={handleLogout} title="Cerrar sesion">
              <LogOut className="h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-4rem)] grid-cols-[220px_1fr]">
        <aside className="border-r border-slate-200 bg-white p-4">
          <nav className="space-y-1">
            {navItems
              .filter((item) => !item.admin || user?.role === 'ADMIN')
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      isActive ? 'bg-indigo-50 text-brand-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
          </nav>
        </aside>
        <main className="min-w-0 p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
