import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { components } from '@/types/dummyjson'

type AuthResponse = components['schemas']['AuthResponse']

// Auth State
export type AuthState = {
  user: AuthResponse | null
  setUser: (user: AuthResponse | null) => void
  logout: () => void
}

// Token 키 상수
const TOKEN_KEY = 'auth-storage'

// Zustand Store with persist middleware
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: TOKEN_KEY,
    }
  )
)

// Token getters (for interceptors)
export function getAccessToken(): string | null {
  const state = useAuthStore.getState()
  return state.user?.accessToken ?? null
}

export function getRefreshToken(): string | null {
  const state = useAuthStore.getState()
  return state.user?.refreshToken ?? null
}
