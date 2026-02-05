import { Navigate, useLocation } from 'react-router'
import { create } from 'zustand'

import { paths } from '@/config/paths'

export interface User {
  id: string
  email: string
  name: string
}

export interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))

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
