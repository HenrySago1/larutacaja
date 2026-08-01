import { create } from 'zustand';
import type { CajaTurno } from '../types/domain';

type CajaState = {
  caja: CajaTurno | null;
  setCaja: (caja: CajaTurno | null) => void;
};

export const useCajaStore = create<CajaState>((set) => ({
  caja: null,
  setCaja: (caja) => set({ caja }),
}));
