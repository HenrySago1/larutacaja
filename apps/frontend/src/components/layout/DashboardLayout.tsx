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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="lg:hidden p-2 h-9 w-9" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5 text-slate-700" /> : <Menu className="h-5 w-5 text-slate-700" />}
            </Button>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-sm font-black text-lg">
                R
              </div>
              <div>
                <p className="text-base font-extrabold text-slate-900 leading-tight">LA RUTA</p>
                <p className="text-[11px] font-semibold text-slate-400 hidden sm:block">Caja e Inventario</p>
              </div>
            </div>
            <Badge tone="green" className="hidden sm:inline-flex text-[11px] ml-2">Sistema activo</Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name || 'Administrador'}</p>
              <p className="text-[11px] font-semibold text-brand-600 uppercase tracking-wider">{user?.role || 'ADMIN'}</p>
            </div>
            <Button variant="secondary" className="h-9 px-3 text-xs font-bold gap-1.5" onClick={handleLogout} title="Cerrar sesión">
              <LogOut className="h-3.5 w-3.5" />
              <span>Salir</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 grid min-h-[calc(100vh-4rem)] lg:grid-cols-[220px_1fr]">
        <aside className={`border-r border-slate-200 bg-white p-4 fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 lg:w-auto z-10 transition-transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <nav className="space-y-1">
            {navItems
              .filter((item) => !item.admin || user?.role === 'ADMIN')
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-brand-50 text-brand-600 shadow-xs' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
          </nav>
        </aside>
        
        {/* Overlay for mobile menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-16 z-0 bg-slate-900/40 backdrop-blur-xs lg:hidden" onClick={() => setMobileMenuOpen(false)} />
        )}
        
        <main className="min-w-0 p-3 sm:p-4 lg:p-6 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
