import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AperturaPage } from './features/caja/AperturaPage';
import { CierrePage } from './features/caja/CierrePage';
import { EgresosPage } from './features/egresos/EgresosPage';
import { LoginPage } from './features/auth/LoginPage';
import { InventarioPage } from './features/inventario/InventarioPage';
import { ImpulsadorasPage } from './features/impulsadoras/ImpulsadorasPage';
import { PosPage } from './features/ventas/PosPage';
import { ReportesPage } from './features/reportes/ReportesPage';
import { UsuariosPage } from './features/usuarios/UsuariosPage';
import { AdminRoute } from './routes/AdminRoute';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { useSessionBootstrap } from './hooks/useSessionBootstrap';

export function App() {
  useSessionBootstrap();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/apertura" element={<AperturaPage />} />
        <Route element={<DashboardLayout />}>
          <Route path="/pos" element={<PosPage />} />
          <Route path="/caja/cierre" element={<CierrePage />} />
          <Route path="/egresos" element={<EgresosPage />} />
          <Route path="/inventario" element={<InventarioPage />} />
          <Route path="/impulsadoras" element={<ImpulsadorasPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/reportes" element={<ReportesPage />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/pos" replace />} />
    </Routes>
  );
}
