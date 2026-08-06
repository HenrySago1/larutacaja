import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriasApi, productosApi } from '../../services/endpoints';
import type { Producto } from '../../types/domain';
import { formatMoney } from '../../utils/money';
import { useAuthStore } from '../../stores/auth-store';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { CategoriasModal } from './CategoriasModal';

const emptyProduct = {
  nombre: '',
  categoriaId: '',
  precioCompra: 0,
  precioVenta: 0,
  stock: 0,
  stockMinimo: 5,
};

export function InventarioPage() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [bajoStock, setBajoStock] = useState(false);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCategorias, setShowCategorias] = useState(false);

  const categoriasQuery = useQuery({ queryKey: ['categorias'], queryFn: categoriasApi.list });
  const productosQuery = useQuery({
    queryKey: ['productos', categoriaId, search, bajoStock],
    queryFn: () => productosApi.list({ categoriaId: categoriaId || undefined, search: search || undefined, bajoStock }),
  });

  const firstCategoryId = categoriasQuery.data?.[0]?.id ?? '';
  const effectiveForm = useMemo(() => ({ ...form, categoriaId: form.categoriaId || firstCategoryId }), [firstCategoryId, form]);

  const saveMutation = useMutation({
    mutationFn: () => editingId ? productosApi.update(editingId, effectiveForm as unknown as Partial<Producto>) : productosApi.create(effectiveForm as unknown as Partial<Producto>),
    onSuccess: async () => {
      setForm(emptyProduct);
      setEditingId(null);
      await queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Error al guardar el producto');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: productosApi.delete,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['productos'] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || 'Error al eliminar el producto');
    }
  });

  function edit(producto: Producto) {
    setEditingId(producto.id);
    setForm({
      nombre: producto.nombre,
      categoriaId: producto.categoriaId,
      precioCompra: Number(producto.precioCompra),
      precioVenta: Number(producto.precioVenta),
      stock: producto.stock,
      stockMinimo: producto.stockMinimo,
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    saveMutation.mutate();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950">Inventario de Productos</h1>
          <p className="text-sm text-slate-500">Control de precios, stock y alertas minimas</p>
        </div>
        {user?.role === 'ADMIN' ? (
          <Button variant="secondary" onClick={() => setShowCategorias(true)}>Gestionar Categorias</Button>
        ) : null}
      </div>
      {user?.role === 'ADMIN' ? (
        <Card className="p-5 shadow-sm border-slate-200">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
            {editingId ? 'Editando producto de inventario' : 'Registrar nuevo producto'}
          </h2>
          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 items-end" onSubmit={handleSubmit}>
            <div className="xl:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nombre del producto <span className="text-red-500">*</span>
              </label>
              <Input placeholder="Ej. Ron Abuelo 750ml" value={form.nombre} onChange={(event) => setForm({ ...form, nombre: event.target.value })} required />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Categoría <span className="text-red-500">*</span>
              </label>
              <Select value={effectiveForm.categoriaId} onChange={(event) => setForm({ ...form, categoriaId: event.target.value })}>
                {categoriasQuery.data?.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">P. Compra (Bs.)</label>
              <Input type="number" min="0" step="0.01" placeholder="0.00" value={form.precioCompra} onChange={(event) => setForm({ ...form, precioCompra: Number(event.target.value) })} onFocus={(e) => e.target.select()} />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">P. Venta (Bs.)</label>
              <Input type="number" min="0" step="0.01" placeholder="0.00" value={form.precioVenta} onChange={(event) => setForm({ ...form, precioVenta: Number(event.target.value) })} onFocus={(e) => e.target.select()} />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Stock Actual</label>
              <Input type="number" min="0" placeholder="0" value={form.stock} onChange={(event) => setForm({ ...form, stock: Number(event.target.value) })} onFocus={(e) => e.target.select()} />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Stock Mínimo</label>
              <Input type="number" min="0" placeholder="5" value={form.stockMinimo} onChange={(event) => setForm({ ...form, stockMinimo: Number(event.target.value) })} onFocus={(e) => e.target.select()} />
            </div>

            <div className="flex gap-2">
              <Button disabled={saveMutation.isPending} className="w-full h-10 text-xs font-bold bg-brand-600 text-white hover:bg-brand-500 shadow-xs">
                {editingId ? 'Actualizar' : 'Guardar'}
              </Button>
              {editingId && (
                <Button type="button" variant="secondary" className="h-10 text-xs font-bold" onClick={() => { setEditingId(null); setForm(emptyProduct); }}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Card>
      ) : null}
      <Card className="p-5">
        <div className="mb-4 grid grid-cols-1 md:grid-cols-[1fr_220px_180px] gap-3">
          <Input placeholder="Buscar producto..." value={search} onChange={(event) => setSearch(event.target.value)} />
          <Select value={categoriaId} onChange={(event) => setCategoriaId(event.target.value)}>
            <option value="">Todas</option>
            {categoriasQuery.data?.map((categoria) => <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>)}
          </Select>
          <Button variant={bajoStock ? 'primary' : 'secondary'} onClick={() => setBajoStock((value) => !value)}>Bajo stock</Button>
        </div>
        <div className="overflow-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                <th className="py-3">Nombre</th>
                <th>Categoria</th>
                <th>P. Compra</th>
                <th>P. Venta</th>
                <th>Stock</th>
                <th>Minimo</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {productosQuery.data?.map((producto) => {
                const tone = producto.stock <= 0 ? 'red' : producto.stock <= producto.stockMinimo ? 'amber' : 'green';
                const label = producto.stock <= 0 ? 'SIN STOCK' : producto.stock <= producto.stockMinimo ? 'BAJO STOCK' : 'ACTIVO';
                return (
                  <tr key={producto.id} className="border-b border-slate-100">
                    <td className="py-3 font-semibold text-slate-950">{producto.nombre}</td>
                    <td>{producto.categoria.nombre}</td>
                    <td>{formatMoney(producto.precioCompra)}</td>
                    <td>{formatMoney(producto.precioVenta)}</td>
                    <td>{producto.stock}</td>
                    <td>{producto.stockMinimo}</td>
                    <td><Badge tone={tone}>{label}</Badge></td>
                    <td>
                      {user?.role === 'ADMIN' ? (
                        <div className="flex gap-2">
                          <Button variant="secondary" onClick={() => edit(producto)}>Editar</Button>
                          <Button variant="secondary" onClick={() => {
                            if (confirm('Seguro que deseas eliminar este producto?')) {
                              deleteMutation.mutate(producto.id);
                            }
                          }}>Borrar</Button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      
      {showCategorias && categoriasQuery.data && (
        <CategoriasModal categorias={categoriasQuery.data} onClose={() => setShowCategorias(false)} />
      )}
    </div>
  );
}

