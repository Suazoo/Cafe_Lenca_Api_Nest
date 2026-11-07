import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EstadoCliente {
  correo: string | null;
  setCorreo: (correo: string) => void;
  olvidar: () => void;
}

// Provisional: cuando integremos Supabase Auth, el correo saldrá de la sesión.
export const useCliente = create<EstadoCliente>()(
  persist(
    (set) => ({
      correo: null,
      setCorreo: (correo) => set({ correo: correo.trim() }),
      olvidar: () => set({ correo: null }),
    }),
    { name: 'cliente' },
  ),
);