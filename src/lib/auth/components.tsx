import { Navigate, useLocation } from 'react-router'

import { paths } from '@/config/paths'

import { useAuthStore } from './store'

type ProtectedRouteProps = {
  children: React.ReactNode
}

// Protected Route Component
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

// Public Route Component (redirect to app if logged in)
export function PublicRoute({ children }: ProtectedRouteProps) {
  const user = useAuthStore((s) => s.user)

  if (user) {
    return (
      <Navigate
        to={paths.app.root.getHref()}
        replace
      />
    )
  }

  return <>{children}</>
}
