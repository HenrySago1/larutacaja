import { api, unwrap } from './api';
import type { CajaDetalle, CajaTurno, Categoria, ConceptoEgreso, Egreso, Impulsadora, Producto, TipoPago, User, Venta } from '../types/domain';

export const authApi = {
  me: () => unwrap<User>(api.get('/auth/me')),
  users: () => unwrap<User[]>(api.get('/auth/users')),
  login: (payload: { email: string; password?: string }) => unwrap<{ token: string; user: User }>(api.post('/auth/login', payload)),
  registerCajero: (payload: { email: string; password: string; name: string }) => unwrap<{ message: string; id: string }>(api.post('/auth/register-cajero', payload)),
  updateUser: (id: string, payload: { email?: string; password?: string; name?: string }) => unwrap<User>(api.put(`/auth/users/${id}`, payload)),
  deleteUser: (id: string) => unwrap<{ message: string }>(api.delete(`/auth/users/${id}`)),
};

export const cajaApi = {
  activo: () => unwrap<CajaTurno | null>(api.get('/caja/activo')),
  historial: () => unwrap<CajaTurno[]>(api.get('/caja/historial')),
  abrir: (payload: { totalBilletesInicial: number; totalMonedasInicial: number; entregadoPor: string; recibidoPor: string }) => unwrap<CajaTurno>(api.post('/caja/abrir', payload)),
  cerrar: (payload: { cajaReal: number; notas?: string }) => unwrap<CajaTurno>(api.post('/caja/cerrar', payload)),
};

export const productosApi = {
  list: (params?: { categoriaId?: string; search?: string; bajoStock?: boolean }) => unwrap<Producto[]>(api.get('/productos', { params })),
  create: (payload: Partial<Producto>) => unwrap<Producto>(api.post('/productos', payload)),
  update: (id: string, payload: Partial<Producto>) => unwrap<Producto>(api.put(`/productos/${id}`, payload)),
  delete: (id: string) => unwrap<{ message: string }>(api.delete(`/productos/${id}`)),
};

export const categoriasApi = {
  list: () => unwrap<Categoria[]>(api.get('/categorias')),
  create: (payload: { nombre: string }) => unwrap<Categoria>(api.post('/categorias', payload)),
  update: (id: string, payload: Partial<Categoria>) => unwrap<Categoria>(api.put(`/categorias/${id}`, payload)),
  delete: (id: string) => unwrap<{ message: string }>(api.delete(`/categorias/${id}`)),
};

export const impulsadorasApi = {
  list: () => unwrap<Impulsadora[]>(api.get('/impulsadoras')),
  create: (payload: { nombre: string }) => unwrap<Impulsadora>(api.post('/impulsadoras', payload)),
  update: (id: string, payload: Partial<Impulsadora>) => unwrap<Impulsadora>(api.put(`/impulsadoras/${id}`, payload)),
};

export const ventasApi = {
  list: () => unwrap<Venta[]>(api.get('/ventas')),
  create: (payload: { tipoPago: TipoPago; impulsadoraId?: string | null; montoEfectivo?: number; montoQr?: number; montoTransf?: number; detalles: { productoId: string; cantidad: number; precioUnitarioPersonalizado?: number }[] }) =>
    unwrap<{ message: string; id: string; total: string }>(api.post('/ventas', payload)),
};

export const egresosApi = {
  list: () => unwrap<Egreso[]>(api.get('/egresos')),
  create: (payload: { concepto: ConceptoEgreso; detalle: string; monto: number }) => unwrap<Egreso>(api.post('/egresos', payload)),
};

export const reportesApi = {
  resumenDia: (params?: { desde?: string; hasta?: string }) => unwrap<{ ventas: Venta[]; egresos: Egreso[]; bajoStock: Producto[]; cajas: CajaTurno[] }>(api.get('/reportes/resumen-dia', { params })),
  detalleCaja: (id: string) => unwrap<CajaDetalle>(api.get(`/reportes/cajas/${id}`)),
};

