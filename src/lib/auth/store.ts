import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { components } from '@/types/dummyjson'

type AuthResponse = components['schemas']['AuthResponse']

// 사용자 역할
export type UserRole = 'USER' | 'APPROVER' | 'ADMIN'

// Auth State
export type AuthState = {
  user: AuthResponse | null
  role: UserRole
  setUser: (user: AuthResponse | null) => void
  setRole: (role: UserRole) => void
  logout: () => void
}

// 역할 레벨 (권한 비교용)
export function getRoleLevel(role: UserRole): number {
  switch (role) {
    case 'ADMIN':
      return 2
    case 'APPROVER':
      return 1
    case 'USER':
      return 0
  }
}

// Token 키 상수
const TOKEN_KEY = 'auth-storage'

// Zustand Store with persist middleware
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: 'USER' as UserRole,
      setUser: (user) => set({ user }),
      setRole: (role) => set({ role }),
      logout: () => set({ user: null, role: 'USER' }),
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
