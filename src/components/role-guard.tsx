import { Navigate } from 'react-router'

import { paths } from '@/config/paths'
import type { UserRole } from '@/lib/auth'
import { getRoleLevel, useAuthStore } from '@/lib/auth'

export function RoleGuard({ minRole, children }: { minRole: UserRole; children: React.ReactNode }) {
  const role = useAuthStore((s) => s.role)

  if (getRoleLevel(role) < getRoleLevel(minRole)) {
    return (
      <Navigate
        to={paths.app.dashboard.getHref()}
        replace
      />
    )
  }

  return <>{children}</>
}
