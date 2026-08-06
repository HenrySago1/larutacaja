import { create } from 'zustand';
import type { Producto, TipoPago } from '../types/domain';

export type CartItem = {
  producto: Producto;
  cantidad: number;
  precioPersonalizado?: number;
};

type PosState = {
  items: CartItem[];
  tipoPago: TipoPago | '';
  impulsadoraId: string;
  addItem: (producto: Producto) => void;
  updateQuantity: (productoId: string, cantidad: number) => void;
  removeItem: (productoId: string) => void;
  setItemPrice: (productoId: string, precio: number | undefined) => void;
  clear: () => void;
  setTipoPago: (tipoPago: TipoPago | '') => void;
  setImpulsadoraId: (id: string) => void;
};

export const usePosStore = create<PosState>((set) => ({
  items: [],
  tipoPago: '',
  impulsadoraId: '',
  addItem: (producto) =>
    set((state) => {
      const existing = state.items.find((item) => item.producto.id === producto.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.producto.id === producto.id ? { ...item, cantidad: Math.min(item.cantidad + 1, producto.stock) } : item,
          ),
        };
      }
      return { items: [...state.items, { producto, cantidad: 1 }] };
    }),
  updateQuantity: (productoId, cantidad) =>
    set((state) => {
      if (cantidad <= 0) {
        return { items: state.items.filter((item) => item.producto.id !== productoId) };
      }
      return {
        items: state.items.map((item) =>
          item.producto.id === productoId
            ? { ...item, cantidad: Math.min(cantidad, item.producto.stock) }
            : item,
        ),
      };
    }),
  removeItem: (productoId) => set((state) => ({ items: state.items.filter((item) => item.producto.id !== productoId) })),
  setItemPrice: (productoId, precio) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.producto.id === productoId ? { ...item, precioPersonalizado: precio } : item,
      ),
    })),
  clear: () => set({ items: [], tipoPago: '', impulsadoraId: '' }),
  setTipoPago: (tipoPago) => set({ tipoPago }),
  setImpulsadoraId: (impulsadoraId) => set({ impulsadoraId }),
}));
