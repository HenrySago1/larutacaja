import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRightLeft, 
  ChevronDown, 
  ChevronUp, 
  CreditCard, 
  Minus, 
  PackageX, 
  Plus, 
  QrCode, 
  Receipt, 
  Search, 
  ShoppingCart, 
  Tag, 
  Trash2, 
  UserCheck, 
  Wallet 
} from 'lucide-react';
import { cajaApi, categoriasApi, impulsadorasApi, productosApi, ventasApi } from '../../services/endpoints';
import { usePosStore } from '../../stores/pos-store';
import type { TipoPago } from '../../types/domain';
import { formatMoney } from '../../utils/money';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Modal } from '../../components/ui/modal';

const paymentMethods: { id: TipoPago; label: string; icon: typeof Wallet }[] = [
  { id: 'EFECTIVO', label: 'Efectivo', icon: Wallet },
  { id: 'QR', label: 'QR', icon: QrCode },
  { id: 'TRANSFERENCIA', label: 'Transf.', icon: CreditCard },
  { id: 'MIXTO', label: 'Mixto', icon: ArrowRightLeft },
];

export function PosPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [showVentas, setShowVentas] = useState(false);
  const [showMixedModal, setShowMixedModal] = useState(false);
  const [montoEfectivo, setMontoEfectivo] = useState<number | ''>('');
  const [montoQr, setMontoQr] = useState<number | ''>('');
  const { 
    items, 
    addItem, 
    updateQuantity, 
    removeItem, 
    setItemPrice, 
    clear, 
    tipoPago, 
    setTipoPago, 
    impulsadoraId, 
    setImpulsadoraId 
  } = usePosStore();

  const cajaQuery = useQuery({ queryKey: ['caja-activa'], queryFn: cajaApi.activo });
  const categoriasQuery = useQuery({ queryKey: ['categorias'], queryFn: categoriasApi.list });
  const impulsadorasQuery = useQuery({ queryKey: ['impulsadoras'], queryFn: impulsadorasApi.list });
  const productosQuery = useQuery({
    queryKey: ['productos', categoriaId, search],
    queryFn: () => productosApi.list({ categoriaId: categoriaId || undefined, search: search || undefined }),
  });
  const ventasQuery = useQuery({
    queryKey: ['ventas-turno'],
    queryFn: ventasApi.list,
    enabled: !!cajaQuery.data,
  });

  const total = useMemo(
    () => items.reduce((acc, item) => acc + Number(item.precioPersonalizado ?? item.producto.precioVenta) * item.cantidad, 0),
    [items],
  );

  const totalItemsCount = useMemo(
    () => items.reduce((acc, item) => acc + item.cantidad, 0),
    [items],
  );

  const cobrarMutation = useMutation({
    mutationFn: ventasApi.create,
    onSuccess: async () => {
      clear();
      setShowMixedModal(false);
      setMontoEfectivo('');
      setMontoQr('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['productos'] }),
        queryClient.invalidateQueries({ queryKey: ['caja-activa'] }),
        queryClient.invalidateQueries({ queryKey: ['ventas-turno'] }),
      ]);
    },
  });

  useEffect(() => {
    if (cajaQuery.isFetched && !cajaQuery.data) {
      navigate('/apertura');
    }
  }, [cajaQuery.data, cajaQuery.isFetched, navigate]);

  const handleCobrar = useCallback(() => {
    if (!tipoPago || !items.length || !impulsadoraId) return;

    if (tipoPago === 'MIXTO' && !showMixedModal) {
      setShowMixedModal(true);
      return;
    }

    cobrarMutation.mutate({
      tipoPago,
      impulsadoraId,
      montoEfectivo: tipoPago === 'MIXTO' && montoEfectivo !== '' ? Number(montoEfectivo) : undefined,
      montoQr: tipoPago === 'MIXTO' && montoQr !== '' ? Number(montoQr) : undefined,
      detalles: items.map((item) => ({ 
        productoId: item.producto.id, 
        cantidad: item.cantidad,
        precioUnitarioPersonalizado: item.precioPersonalizado 
      })),
    });
  }, [cobrarMutation, impulsadoraId, items, tipoPago, showMixedModal, montoEfectivo, montoQr]);

  useEffect(() => {
    function handleKeys(event: KeyboardEvent) {
      if (event.key === 'F1') {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === 'F2') {
        event.preventDefault();
        document.getElementById('impulsadora-select')?.focus();
      }
      if (event.code === 'Space' && items.length && tipoPago && impulsadoraId) {
        // Evitar activar la tecla espacio si se está escribiendo en un input
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes((event.target as HTMLElement)?.tagName)) {
          return;
        }
        event.preventDefault();
        handleCobrar();
      }
    }

    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [handleCobrar, impulsadoraId, items.length, tipoPago]);

  return (
    <div className="flex flex-col gap-4 max-w-[1800px] mx-auto w-full pb-6">
      {/* Upper POS Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">Terminal de Ventas</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              Estado de Caja: {cajaQuery.data ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  ABIERTA
                </span>
              ) : (
                <span className="text-slate-400">Cargando...</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <span>Accesos rápidos:</span>
            <kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-semibold text-slate-600">F1</kbd> Buscar
            <kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-semibold text-slate-600">F2</kbd> Impulsadora
            <kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-semibold text-slate-600">Espacio</kbd> Cobrar
          </div>
          <Button variant="danger" className="h-9 px-3 text-xs" onClick={() => navigate('/caja/cierre')}>
            Cerrar turno
          </Button>
        </div>
      </div>

      {/* Main 3-Column POS Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_360px] xl:grid-cols-[240px_1fr_400px] gap-4 items-start">
        
        {/* Left Column: Categorías & Search */}
        <Card className="p-4 flex flex-col gap-4">
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5" /> Buscador
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                ref={searchRef}
                className="pl-9 text-sm h-9"
                placeholder="Buscar (F1)..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && (
                <button 
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full h-4 w-4 flex items-center justify-center"
                  onClick={() => setSearch('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> Categorías
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                {categoriasQuery.data?.length ?? 0}
              </span>
            </h2>
            
            <div className="flex flex-col gap-1.5 max-h-[calc(100vh-22rem)] overflow-y-auto pr-1">
              <button
                type="button"
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between ${
                  !categoriaId 
                    ? 'bg-brand-600 text-white shadow-sm font-bold' 
                    : 'text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                }`}
                onClick={() => setCategoriaId('')}
              >
                <span>Todas las categorías</span>
                {!categoriaId && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </button>

              {categoriasQuery.data?.map((categoria) => {
                const isSelected = categoriaId === categoria.id;
                return (
                  <button
                    key={categoria.id}
                    type="button"
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between truncate ${
                      isSelected 
                        ? 'bg-brand-600 text-white shadow-sm font-bold' 
                        : 'text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                    }`}
                    onClick={() => setCategoriaId(categoria.id)}
                  >
                    <span className="truncate">{categoria.nombre}</span>
                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Center Column: Product Catalog Grid */}
        <section className="flex flex-col gap-3 min-w-0">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-700">
              Catálogo de Productos 
              <span className="ml-2 text-xs font-normal text-slate-400">
                ({productosQuery.data?.length ?? 0} disponibles)
              </span>
            </h2>
          </div>

          {productosQuery.isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (productosQuery.data?.length ?? 0) === 0 ? (
            <Card className="p-8 text-center flex flex-col items-center justify-center gap-2 text-slate-400">
              <PackageX className="h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold">No se encontraron productos.</p>
              <p className="text-xs text-slate-400">Intenta buscar con otros términos o seleccionando otra categoría.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5">
              {productosQuery.data?.map((producto) => {
                const sinStock = producto.stock <= 0;
                const bajoStock = producto.stock > 0 && producto.stock <= producto.stockMinimo;
                return (
                  <div
                    key={producto.id}
                    onClick={() => !sinStock && addItem(producto)}
                    className={`group relative flex flex-col justify-between rounded-xl border p-3.5 transition-all duration-200 bg-white ${
                      sinStock 
                        ? 'opacity-50 bg-slate-50 border-slate-200 cursor-not-allowed' 
                        : 'border-slate-200/80 hover:border-brand-500 hover:shadow-md cursor-pointer'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider truncate flex-1">
                          {producto.categoria?.nombre || 'General'}
                        </span>
                        {sinStock ? (
                          <span className="flex items-center gap-1 shrink-0" title="Sin Stock (0 u.)">
                            <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-xs" />
                          </span>
                        ) : bajoStock ? (
                          <span className="flex items-center gap-1 shrink-0" title={`Bajo Stock (${producto.stock} u.)`}>
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse shadow-xs" />
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 shrink-0" title={`Disponible (${producto.stock} u.)`}>
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-xs" />
                          </span>
                        )}
                      </div>

                      <h3 className="mt-1 text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 min-h-[2.5rem] leading-snug">
                        {producto.nombre}
                      </h3>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase truncate">Stock: {producto.stock}</p>
                        <p className="text-base font-black text-slate-900 leading-tight truncate">
                          {formatMoney(producto.precioVenta)}
                        </p>
                      </div>

                      <Button
                        type="button"
                        disabled={sinStock}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!sinStock) addItem(producto);
                        }}
                        className={`h-8 px-2.5 text-xs font-bold shrink-0 flex items-center gap-1 transition-all ${
                          sinStock
                            ? 'bg-slate-100 text-slate-400 border border-slate-200'
                            : 'bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white border border-brand-200 hover:border-brand-600 shadow-2xs'
                        }`}
                        title="Agregar producto"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Agregar</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right Column: Order Detail & Payment Panel */}
        <Card className="p-4 flex flex-col gap-4 shadow-sm border-slate-200 sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-brand-600" />
              <h2 className="text-base font-extrabold text-slate-900">Detalle de la Venta</h2>
            </div>
            {items.length > 0 && (
              <Badge tone="indigo" className="text-xs font-bold">
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
              </Badge>
            )}
          </div>

          {/* Selector de Impulsadora */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-slate-400" /> Impulsadora <span className="text-red-500">*</span>
            </label>
            <Select 
              id="impulsadora-select" 
              className="text-xs h-9" 
              value={impulsadoraId} 
              onChange={(event) => setImpulsadoraId(event.target.value)}
            >
              <option value="">Seleccionar impulsadora (F2)...</option>
              {impulsadorasQuery.data?.filter(i => i.isActive).map((impulsadora) => (
                <option key={impulsadora.id} value={impulsadora.id}>{impulsadora.nombre}</option>
              ))}
            </Select>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto max-h-[320px] min-h-[140px] space-y-2.5 pr-1">
            {items.length === 0 ? (
              <div className="h-36 flex flex-col items-center justify-center text-slate-400 gap-1.5 text-center px-4">
                <ShoppingCart className="h-8 w-8 text-slate-300" />
                <p className="text-xs font-semibold">Sin productos agregados</p>
                <p className="text-[11px] text-slate-400">Haz clic en los productos para agregarlos a la venta.</p>
              </div>
            ) : (
              items.map((item) => {
                const subtotal = Number(item.precioPersonalizado ?? item.producto.precioVenta) * item.cantidad;
                return (
                  <div key={item.producto.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 leading-snug flex-1">
                        {item.producto.nombre}
                      </p>
                      <button
                        type="button"
                        className="text-slate-400 hover:text-red-600 transition p-0.5 rounded"
                        onClick={() => removeItem(item.producto.id)}
                        title="Quitar producto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      {/* Quantity buttons */}
                      <div className="flex items-center border border-slate-200 rounded-md bg-white">
                        <button
                          type="button"
                          className="h-6 w-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-l-md"
                          onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-slate-900">
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          className="h-6 w-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-r-md disabled:opacity-30"
                          disabled={item.cantidad >= item.producto.stock}
                          onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Custom price input */}
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-semibold text-slate-400">Bs.</span>
                        <Input
                          type="number"
                          min={Number(item.producto.precioCompra)}
                          step="0.1"
                          className="h-6 w-16 px-1.5 text-xs text-right font-semibold"
                          value={item.precioPersonalizado ?? item.producto.precioVenta}
                          onChange={(e) => setItemPrice(item.producto.id, e.target.value ? Number(e.target.value) : undefined)}
                          title={`Precio sugerido: Bs. ${item.producto.precioVenta}`}
                        />
                      </div>

                      {/* Subtotal */}
                      <span className="text-xs font-black text-slate-900 text-right min-w-[55px]">
                        {formatMoney(subtotal)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Método de pago */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Método de Pago <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = tipoPago === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                    onClick={() => setTipoPago(method.id)}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Total & Action Button */}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
            <div className="flex items-baseline justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Total a pagar</span>
              <span className="text-2xl font-black text-slate-900">{formatMoney(total)}</span>
            </div>

            {cobrarMutation.error ? (
              <p className="rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-700 border border-red-200">
                {(cobrarMutation.error as any)?.response?.data?.message || 'No se pudo registrar la venta.'}
              </p>
            ) : null}

            <Button
              className="w-full h-11 text-sm font-bold shadow-md bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center gap-2"
              disabled={!items.length || !tipoPago || !impulsadoraId || cobrarMutation.isPending}
              onClick={handleCobrar}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{cobrarMutation.isPending ? 'Procesando...' : 'Cobrar Venta'}</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Panel de Ventas del Turno (Docked Bottom Accordion) */}
      <Card className="mt-2 overflow-hidden border-slate-200 shadow-sm">
        <button
          type="button"
          className="flex w-full items-center justify-between px-4 py-3 bg-slate-50/80 hover:bg-slate-100/80 transition text-left"
          onClick={() => setShowVentas((v) => !v)}
        >
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
              Ventas del Turno Activo
            </h2>
            <Badge tone="indigo" className="text-xs font-bold">
              {ventasQuery.data?.length ?? 0} registradas
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>{showVentas ? 'Ocultar tabla' : 'Ver detalle de ventas'}</span>
            {showVentas ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </div>
        </button>

        {showVentas ? (
          <div className="max-h-64 overflow-y-auto border-t border-slate-200 p-4 bg-white">
            {(ventasQuery.data?.length ?? 0) === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">Aún no se han registrado ventas en este turno.</p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] uppercase font-bold text-slate-400">
                    <th className="py-2">Hora</th>
                    <th>Productos</th>
                    <th>Impulsadora</th>
                    <th>Pago</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ventasQuery.data?.map((venta) => (
                    <tr key={venta.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 font-medium text-slate-500">
                        {new Date(venta.createdAt).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="font-semibold text-slate-800">
                        {venta.detalles.map((d) => `${d.cantidad}x ${d.producto.nombre}`).join(', ')}
                      </td>
                      <td className="text-slate-600">{venta.impulsadora?.nombre ?? 'Directo'}</td>
                      <td>
                        <Badge tone={venta.tipoPago === 'EFECTIVO' ? 'green' : venta.tipoPago === 'QR' ? 'indigo' : 'slate'} className="text-[10px]">
                          {venta.tipoPago}
                        </Badge>
                      </td>
                      <td className="text-right font-black text-slate-900">{formatMoney(venta.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : null}
      </Card>

      {/* Modal para Pago Mixto */}
      <Modal open={showMixedModal} onClose={() => setShowMixedModal(false)} title="Pago Mixto">
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Distribuye el total de <strong className="text-slate-900 font-bold">{formatMoney(total)}</strong> entre los diferentes métodos de pago.
          </p>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Monto en Efectivo
            <Input 
              className="mt-1.5 text-sm" 
              type="number" 
              min="0" 
              step="0.1" 
              placeholder="0.00"
              value={montoEfectivo} 
              onChange={(e) => setMontoEfectivo(e.target.value === '' ? '' : Number(e.target.value))} 
            />
          </label>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            Monto en QR
            <Input 
              className="mt-1.5 text-sm" 
              type="number" 
              min="0" 
              step="0.1" 
              placeholder="0.00"
              value={montoQr} 
              onChange={(e) => setMontoQr(e.target.value === '' ? '' : Number(e.target.value))} 
            />
          </label>
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-3.5 text-center">
            <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Suma total ingresada</p>
            <p className="mt-0.5 text-2xl font-black text-indigo-950">
              {formatMoney((Number(montoEfectivo) || 0) + (Number(montoQr) || 0))}
            </p>
          </div>
          {cobrarMutation.error ? (
            <p className="rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-700 border border-red-200">
              {(cobrarMutation.error as any)?.response?.data?.message || 'Error al procesar el pago mixtos.'}
            </p>
          ) : null}
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" className="h-9 px-4 text-xs font-bold" onClick={() => setShowMixedModal(false)}>
              Cancelar
            </Button>
            <Button 
              className="h-9 px-4 text-xs font-bold bg-brand-600 text-white hover:bg-brand-500"
              disabled={cobrarMutation.isPending || (Number(montoEfectivo) || 0) + (Number(montoQr) || 0) !== total} 
              onClick={handleCobrar}
            >
              Confirmar Venta
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

