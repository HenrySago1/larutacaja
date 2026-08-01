export type Role = 'ADMIN' | 'CAJERO';
export type EstadoCaja = 'ABIERTO' | 'CERRADO';
export type TipoPago = 'EFECTIVO' | 'QR' | 'TRANSFERENCIA' | 'MIXTO';
export type ConceptoEgreso = 'HIELO' | 'SODA' | 'TRANSPORTE' | 'PROVEEDOR' | 'OTRO';

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
  firebaseUid: string;
};

export type CajaTurno = {
  id: string;
  fechaApertura: string;
  fechaCierre?: string | null;
  totalInicial: string;
  totalBilletesInicial: string;
  totalMonedasInicial: string;
  entregadoPor: string;
  recibidoPor: string;
  totalVentasEfectivo: string;
  totalVentasQr: string;
  totalVentasTransf: string;
  totalEgresos: string;
  cajaEsperada: string;
  cajaReal?: string | null;
  diferencia?: string | null;
  notas?: string | null;
  estado: EstadoCaja;
};

export type Categoria = {
  id: string;
  nombre: string;
};

export type Producto = {
  id: string;
  nombre: string;
  precioVenta: string;
  precioCompra: string;
  stock: number;
  stockMinimo: number;
  imgUrl?: string | null;
  isActive: boolean;
  categoria: Categoria;
  categoriaId: string;
};

export type Impulsadora = {
  id: string;
  nombre: string;
  isActive: boolean;
};

export type VentaDetalle = {
  productoId: string;
  cantidad: number;
};

export type DetalleVenta = {
  id: string;
  cantidad: number;
  precioUnitario: string;
  subtotal: string;
  producto: Producto;
};

export type Venta = {
  id: string;
  tipoPago: TipoPago;
  total: string;
  createdAt: string;
  impulsadora: Impulsadora | null;
  cajero: { id: string; name: string };
  detalles: DetalleVenta[];
};

export type Egreso = {
  id: string;
  concepto: ConceptoEgreso;
  detalle: string;
  monto: string;
  createdAt: string;
  cajero?: { id: string; name: string };
};

export type CajaDetalle = CajaTurno & {
  userApertura: { id: string; name: string; email: string };
  userCierre?: { id: string; name: string; email: string } | null;
  ventasAsociadas: Venta[];
  egresosAsociados: Egreso[];
};
