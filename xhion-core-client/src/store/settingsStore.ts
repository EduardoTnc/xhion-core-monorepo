import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  accentColor: 'blue' | 'purple' | 'green' | 'orange';
  density: 'compact' | 'comfortable' | 'spacious';
  language: 'es' | 'en' | 'pt';
  timezone: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  taskAssigned: boolean;
  mentions: boolean;
  projectUpdates: boolean;
  dailySummary: boolean;
}

interface SettingsState {
  preferences: UserPreferences;
  notifications: NotificationSettings;
  isLoading: boolean;
  
  // Actions
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  updateNotifications: (notifications: Partial<NotificationSettings>) => void;
  setLoading: (loading: boolean) => void;
  resetToDefaults: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'dark',
  accentColor: 'blue',
  density: 'comfortable',
  language: 'es',
  timezone: 'America/Mexico_City',
};

const defaultNotifications: NotificationSettings = {
  email: true,
  push: true,
  taskAssigned: true,
  mentions: true,
  projectUpdates: false,
  dailySummary: false,
};

export const useSettingsStore = create(
  persist<SettingsState>(
    (set) => ({
      preferences: defaultPreferences,
      notifications: defaultNotifications,
      isLoading: false,

      updatePreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        })),

      updateNotifications: (newNotifications) =>
        set((state) => ({
          notifications: { ...state.notifications, ...newNotifications },
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      resetToDefaults: () =>
        set({
          preferences: defaultPreferences,
          notifications: defaultNotifications,
        }),
    }),
    {
      name: 'settings-storage',
    }
  )
);
