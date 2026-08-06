import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { BarChart3, Boxes, ChevronLeft, LogOut, Menu, Receipt, ShoppingCart, Sparkles, Users, X } from 'lucide-react';
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
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebar-collapsed') === 'true');

  function toggleCollapse() {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  }

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
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      <div className={`flex-1 grid min-h-[calc(100vh-4rem)] transition-all duration-300 ${isCollapsed ? 'lg:grid-cols-[72px_1fr]' : 'lg:grid-cols-[220px_1fr]'}`}>
        <aside className={`border-r border-slate-200 bg-white fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] z-10 transition-all duration-300 flex flex-col justify-between ${
          isCollapsed ? 'p-2 lg:w-[72px]' : 'p-4 w-64 lg:w-auto'
        } ${mobileMenuOpen ? 'translate-x-0 w-64 p-4' : '-translate-x-full lg:translate-x-0'}`}>
          
          <div>
            {/* Toggle collapse button for desktop */}
            <button
              type="button"
              onClick={toggleCollapse}
              className={`hidden lg:flex w-full items-center justify-center h-8 mb-3 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition ${
                isCollapsed ? '' : 'px-2 justify-between border border-slate-200/80 bg-slate-50/50'
              }`}
              title={isCollapsed ? "Expandir menú" : "Plegar menú"}
            >
              {!isCollapsed && <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Menú</span>}
              <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>

            <nav className="space-y-1">
              {navItems
                .filter((item) => !item.admin || user?.role === 'ADMIN')
                .map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={item.label}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center rounded-xl py-2.5 text-xs font-bold transition-all ${
                        isCollapsed ? 'lg:justify-center lg:px-0 px-3 gap-3' : 'px-3 gap-3'
                      } ${
                        isActive 
                          ? 'bg-brand-50 text-brand-600 shadow-xs' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className={isCollapsed ? 'lg:hidden' : ''}>{item.label}</span>
                  </NavLink>
                ))}
            </nav>
          </div>
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
