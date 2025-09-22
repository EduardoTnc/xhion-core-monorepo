import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Usuario } from '../types/index';

interface AuthState {
  token: string | null;
  user: Usuario | null;
  login: (token: string, user: Usuario) => void;
  logout: () => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      token: null,
      user: null,
      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'auth-storage', // Nombre de la clave en localStorage
    }
  )
);