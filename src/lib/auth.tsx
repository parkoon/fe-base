import { Navigate, useLocation } from 'react-router'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { paths } from '@/config/paths'
import type { components } from '@/types/dummyjson'

// Import type directly from dummyjson types to avoid circular dependency
type AuthResponse = components['schemas']['AuthResponse']

// Auth State
export interface AuthState {
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

// Token getter (for interceptors)
export function getAccessToken(): string | null {
  const state = useAuthStore.getState()
  return state.user?.accessToken ?? null
}

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!user) {
    return (
      <Navigate
        to={paths.auth.login.getHref(location.pathname)}
        replace
      />
    )
  }

  return <>{children}</>
}
