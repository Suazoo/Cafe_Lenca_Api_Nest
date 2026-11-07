import { create } from 'zustand';

export type Tema = 'light' | 'dark' | 'system';
const CLAVE = 'tema';

const leer = (): Tema => {
  try {
    const v = localStorage.getItem(CLAVE);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
};

const aplicar = (tema: Tema): void => {
  const oscuro =
    tema === 'dark' || (tema === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', oscuro);
};

interface EstadoTema {
  tema: Tema;
  setTema: (tema: Tema) => void;
}

export const useTema = create<EstadoTema>((set) => ({
  tema: leer(),
  setTema: (tema) => {
    try {
      localStorage.setItem(CLAVE, tema);
    } catch {
      /* sin almacenamiento disponible: el tema solo dura esta sesión */
    }
    aplicar(tema);
    set({ tema });
  },
}));