import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface Employee {
  id: string;
  full_name: string;
  email: string;
  role_id: number;
  active: boolean;
  roles?: {
    id: number;
    name: string;
  };
}

type User = SupabaseUser;

interface AuthState {
  user: User | null;
  employee: Employee | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCEO: boolean;
  setAuth: (user: User | null, employee: Employee | null) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      employee: null,
      isAuthenticated: false,
      isLoading: true,
      isCEO: false,
      setAuth: (user, employee) =>
        set({
          user,
          employee,
          isAuthenticated: !!user && !!employee,
          isCEO: employee?.roles?.name === 'CEO',
          isLoading: false,
        }),
      clearAuth: () =>
        set({
          user: null,
          employee: null,
          isAuthenticated: false,
          isCEO: false,
          isLoading: false,
        }),
      setLoading: (loading) => {
        console.log('[STORE] setLoading called with:', loading);
        set({ isLoading: loading });
        console.log('[STORE] After set, state:', useAuthStore.getState().isLoading);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        employee: state.employee,
        isAuthenticated: state.isAuthenticated,
        isCEO: state.isCEO,
        // Don't persist isLoading - always start fresh
      }),
      onRehydrateStorage: () => (state) => {
        console.log('[STORE] Rehydration complete, setting isLoading to false');
        // After hydration, if we have auth data, ensure loading is false
        if (state && state.isAuthenticated) {
          state.isLoading = false;
        }
      },
    }
  )
);
