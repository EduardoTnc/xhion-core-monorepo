import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../types/index';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setToken: (token: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  setUser: (user: AuthUser) => void;
  login: (token: string, refreshToken: string, user: AuthUser) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  logout: () => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      status: 'loading',
      token: null,
      refreshToken: null,
      user: null,
      setToken: (token) => set({ token }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setUser: (user) => set({ user }),
      login: (token, refreshToken, user) => set({
        token,
        refreshToken,
        user,
        status: 'authenticated'
      }),
      setAccessToken: (token) => set({ token }),
      clearAuth: () => set({
        token: null,
        refreshToken: null,
        user: null,
        status: 'unauthenticated'
      }),
      logout: () => set({
        token: null,
        refreshToken: null,
        user: null,
        status: 'unauthenticated'
      }),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        // Una vez que el estado se ha rehidratado desde localStorage,
        // determinamos el status basado en si hay un token válido
        if (state) {
          state.status = state.token && state.user ? 'authenticated' : 'unauthenticated';
        }
      },
    }
  )
);