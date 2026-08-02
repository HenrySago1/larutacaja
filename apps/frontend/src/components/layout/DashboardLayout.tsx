import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { BarChart3, Boxes, LogOut, Menu, Receipt, ShoppingCart, Sparkles, Users, X } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <Button variant="ghost" className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6 text-slate-700" /> : <Menu className="h-6 w-6 text-slate-700" />}
            </Button>
            <div>
              <p className="text-lg font-extrabold text-slate-950">LA RUTA</p>
              <p className="text-xs font-medium text-slate-500 hidden sm:block">Caja e Inventario</p>
            </div>
            <Badge tone="green" className="hidden sm:inline-flex">Sistema activo</Badge>
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

      <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[220px_1fr]">
        <aside className={`border-r border-slate-200 bg-white p-4 fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] lg:h-auto w-64 lg:w-auto z-10 transition-transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
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
        
        {/* Overlay for mobile menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-16 z-0 bg-slate-900/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
        )}
        
        <main className="min-w-0 p-4 lg:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
