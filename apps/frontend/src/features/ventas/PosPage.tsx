import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
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

const paymentMethods: TipoPago[] = ['EFECTIVO', 'QR', 'TRANSFERENCIA', 'MIXTO'];

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
  const { items, addItem, removeItem, setItemPrice, clear, tipoPago, setTipoPago, impulsadoraId, setImpulsadoraId } = usePosStore();

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
        event.preventDefault();
        handleCobrar();
      }
    }

    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [handleCobrar, impulsadoraId, items.length, tipoPago]);

  return (
    <div className="flex h-[calc(100vh-6.5rem)] flex-col gap-4">
      <div className="grid min-h-0 flex-1 grid-cols-[280px_1fr_360px] gap-4">
        <Card className="p-4">
          <h2 className="text-sm font-extrabold uppercase text-slate-500">Categorias</h2>
          <div className="mt-3 grid gap-2">
            <Button variant={!categoriaId ? 'primary' : 'secondary'} onClick={() => setCategoriaId('')}>Todos</Button>
            {categoriasQuery.data?.map((categoria) => (
              <Button key={categoria.id} variant={categoriaId === categoria.id ? 'primary' : 'secondary'} onClick={() => setCategoriaId(categoria.id)}>
                {categoria.nombre}
              </Button>
            ))}
          </div>
          <div className="mt-6">
            <h2 className="text-sm font-extrabold uppercase text-slate-500">Buscador</h2>
            <Input ref={searchRef} className="mt-3" placeholder="Buscar por nombre..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
        </Card>

        <section className="min-w-0 overflow-auto">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-950">Terminal de Ventas</h1>
              <p className="text-sm text-slate-500">Caja: {cajaQuery.data ? <span className="font-bold text-emerald-600">ABIERTA</span> : 'cargando'}</p>
            </div>
            <Button variant="danger" onClick={() => navigate('/caja/cierre')}>Cerrar turno</Button>
          </div>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
            {productosQuery.data?.map((producto) => {
              const sinStock = producto.stock <= 0;
              const bajoStock = producto.stock > 0 && producto.stock <= producto.stockMinimo;
              return (
                <Card key={producto.id} className={`p-4 ${sinStock ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-950">{producto.nombre}</h3>
                      <p className="mt-1 text-sm text-slate-500">{producto.categoria.nombre}</p>
                    </div>
                    {sinStock ? <Badge tone="red">Sin stock</Badge> : bajoStock ? <Badge tone="amber">Bajo stock</Badge> : <Badge tone="green">Stock</Badge>}
                  </div>
                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-500">Stock: {producto.stock}</p>
                      <p className="text-xl font-extrabold text-slate-950">{formatMoney(producto.precioVenta)}</p>
                    </div>
                    <Button disabled={sinStock} onClick={() => addItem(producto)} title="Agregar producto">
                      <Plus className="h-4 w-4" />
                      Agregar
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <Card className="flex min-h-0 flex-col p-4">
          <h2 className="text-lg font-extrabold text-slate-950">Detalle de la venta</h2>
          <label className="mt-4 block text-sm font-semibold text-slate-700">
            Impulsadora
            <Select id="impulsadora-select" className="mt-2" value={impulsadoraId} onChange={(event) => setImpulsadoraId(event.target.value)}>
              <option value="">Seleccionar...</option>
              {impulsadorasQuery.data?.map((impulsadora) => (
                <option key={impulsadora.id} value={impulsadora.id}>{impulsadora.nombre}</option>
              ))}
            </Select>
          </label>
          <div className="mt-4 flex-1 overflow-auto border-y border-slate-100 py-3">
            {items.length === 0 ? <p className="text-sm text-slate-500">Sin productos agregados.</p> : null}
            {items.map((item) => (
              <div key={item.producto.id} className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{item.cantidad}x {item.producto.nombre}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium text-slate-500">Bs.</span>
                    <Input 
                      type="number" 
                      min={Number(item.producto.precioCompra)} 
                      step="0.1" 
                      className="h-7 w-20 px-2 text-sm" 
                      value={item.precioPersonalizado ?? item.producto.precioVenta} 
                      onChange={(e) => setItemPrice(item.producto.id, e.target.value ? Number(e.target.value) : undefined)}
                      title={`Precio base: Bs. ${item.producto.precioVenta} (Costo: Bs. ${item.producto.precioCompra})`}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Subtotal: {formatMoney(Number(item.precioPersonalizado ?? item.producto.precioVenta) * item.cantidad)}
                  </p>
                </div>
                <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => removeItem(item.producto.id)} title="Quitar">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <p className="text-sm font-extrabold uppercase text-slate-500">Metodo de pago</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => (
                <Button key={method} variant={tipoPago === method ? 'primary' : 'secondary'} onClick={() => setTipoPago(method)}>{method}</Button>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <p className="text-sm font-extrabold uppercase text-slate-500">Total a pagar</p>
            <p className="text-4xl font-extrabold text-slate-950">{formatMoney(total)}</p>
            {cobrarMutation.error ? <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">No se pudo registrar la venta</p> : null}
            <Button className="mt-4 w-full" disabled={!items.length || !tipoPago || !impulsadoraId || cobrarMutation.isPending} onClick={handleCobrar}>
              Cobrar venta
            </Button>
          </div>
        </Card>
      </div>

      {/* Panel de ventas del turno */}
      <Card className="shrink-0">
        <button
          className="flex w-full items-center justify-between px-5 py-3 text-left transition hover:bg-slate-50"
          onClick={() => setShowVentas((v) => !v)}
        >
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-extrabold uppercase text-slate-500">Ventas del turno</h2>
            <Badge tone="indigo">{ventasQuery.data?.length ?? 0}</Badge>
          </div>
          {showVentas ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronUp className="h-4 w-4 text-slate-400" />}
        </button>
        {showVentas ? (
          <div className="max-h-56 overflow-auto border-t border-slate-100 px-5 py-3">
            {(ventasQuery.data?.length ?? 0) === 0 ? (
              <p className="text-sm text-slate-500">Aun no se han registrado ventas en este turno.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="py-2">Hora</th>
                    <th>Productos</th>
                    <th>Impulsadora</th>
                    <th>Pago</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasQuery.data?.map((venta) => (
                    <tr key={venta.id} className="border-b border-slate-100">
                      <td className="py-2 text-slate-600">{new Date(venta.createdAt).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="text-slate-900">{venta.detalles.map((d) => `${d.cantidad}x ${d.producto.nombre}`).join(', ')}</td>
                      <td className="text-slate-600">{venta.impulsadora?.nombre ?? 'Directo'}</td>
                      <td><Badge tone={venta.tipoPago === 'EFECTIVO' ? 'green' : venta.tipoPago === 'QR' ? 'indigo' : 'slate'}>{venta.tipoPago}</Badge></td>
                      <td className="text-right font-bold text-slate-900">{formatMoney(venta.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : null}
      </Card>

      <Modal open={showMixedModal} onClose={() => setShowMixedModal(false)} title="Pago Mixto">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Distribuye el total de <strong className="text-slate-900">{formatMoney(total)}</strong> entre los diferentes métodos de pago.</p>
          <label className="block text-sm font-semibold text-slate-700">
            Monto en Efectivo
            <Input className="mt-2" type="number" min="0" step="0.1" value={montoEfectivo} onChange={(e) => setMontoEfectivo(e.target.value === '' ? '' : Number(e.target.value))} />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Monto en QR
            <Input className="mt-2" type="number" min="0" step="0.1" value={montoQr} onChange={(e) => setMontoQr(e.target.value === '' ? '' : Number(e.target.value))} />
          </label>
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-center">
            <p className="text-sm font-semibold text-indigo-700">Suma total ingresada</p>
            <p className="mt-1 text-2xl font-extrabold text-indigo-950">{formatMoney((Number(montoEfectivo) || 0) + (Number(montoQr) || 0))}</p>
          </div>
          {cobrarMutation.error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{(cobrarMutation.error as any)?.response?.data?.message || 'Error al procesar el pago'}</p> : null}
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowMixedModal(false)}>Cancelar</Button>
            <Button 
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
