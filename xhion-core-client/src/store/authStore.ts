import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "../types/index";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  lastPermissionSync: number | null;
  setToken: (token: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  setUser: (user: AuthUser) => void;
  login: (token: string, refreshToken: string, user: AuthUser) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  logout: () => void;
  /** Updates user data only if permissions changed (optimized for permission sync) */
  updateUserIfChanged: (newUser: AuthUser) => boolean;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set, get) => ({
      status: "loading",
      token: null,
      refreshToken: null,
      user: null,
      lastPermissionSync: null,
      setToken: (token) => set({ token }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setUser: (user) => set({ user }),
      login: (token, refreshToken, user) =>
        set({
          token,
          refreshToken,
          user,
          status: "authenticated",
          lastPermissionSync: Date.now(),
        }),
      setAccessToken: (token) => set({ token }),
      clearAuth: () =>
        set({
          token: null,
          refreshToken: null,
          user: null,
          status: "unauthenticated",
          lastPermissionSync: null,
        }),
      logout: () =>
        set({
          token: null,
          refreshToken: null,
          user: null,
          status: "unauthenticated",
          lastPermissionSync: null,
        }),
      updateUserIfChanged: (newUser: AuthUser) => {
        const currentUser = get().user;
        if (!currentUser) return false;

        // Compare permissions arrays
        const currentPermisos = currentUser.permisos?.sort().join(",") || "";
        const newPermisos = newUser.permisos?.sort().join(",") || "";

        // Only update if permissions or role changed
        if (
          currentPermisos !== newPermisos ||
          currentUser.rol !== newUser.rol
        ) {
          set({
            user: newUser,
            lastPermissionSync: Date.now(),
          });
          return true; // Indicates permissions were updated
        }

        // Update sync timestamp even if no changes
        set({ lastPermissionSync: Date.now() });
        return false;
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        // Una vez que el estado se ha rehidratado desde localStorage,
        // determinamos el status basado en si hay un token válido
        if (state) {
          state.status =
            state.token && state.user ? "authenticated" : "unauthenticated";
        }
      },
    }
  )
);
