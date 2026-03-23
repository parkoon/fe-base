import { type QueryClient, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router'

import { RoleGuard } from '@/components/role-guard'
import { paths } from '@/config/paths'
import { ProtectedRoute, PublicRoute } from '@/lib/auth'

import AppRoot from './routes/app/root'
import AuthLogin from './routes/auth/login'

/**
 * lazy 모듈을 변환하여 clientLoader/clientAction에 QueryClient를 주입합니다.
 *
 * 라우트 파일에서 다음과 같이 사용:
 * ```ts
 * export const clientLoader = (queryClient: QueryClient) => async () => {
 *   await queryClient.ensureQueryData(someQueryOptions())
 *   return null
 * }
 * ```
 */
/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
const convert = (queryClient: QueryClient) => (m: any) => {
  const { clientLoader, clientAction, default: Component, ...rest } = m
  return {
    ...rest,
    loader: clientLoader?.(queryClient),
    action: clientAction?.(queryClient),
    Component,
  }
}
/* eslint-enable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */

function ApproverGuard() {
  return (
    <RoleGuard minRole="APPROVER">
      <Outlet />
    </RoleGuard>
  )
}

function AdminGuard() {
  return (
    <RoleGuard minRole="ADMIN">
      <Outlet />
    </RoleGuard>
  )
}

const createAppRouter = (queryClient: QueryClient) =>
  createBrowserRouter([
    {
      path: paths.home.path,
      lazy: () => import('./routes/landing').then(convert(queryClient)),
    },
    {
      path: paths.auth.login.path,
      element: (
        <PublicRoute>
          <AuthLogin />
        </PublicRoute>
      ),
    },
    {
      path: paths.app.root.path,
      element: (
        <ProtectedRoute>
          <AppRoot />
        </ProtectedRoute>
      ),
      children: [
        // 대시보드
        {
          path: paths.app.dashboard.path,
          lazy: () => import('./routes/app/dashboard').then(convert(queryClient)),
        },

        // 설정
        {
          path: 'settings',
          lazy: () => import('./routes/app/settings').then(convert(queryClient)),
        },

        // 웹쿼리
        {
          path: paths.app.query.editor.path,
          lazy: () => import('./routes/app/query/editor').then(convert(queryClient)),
        },
        {
          path: paths.app.query.history.path,
          lazy: () => import('./routes/app/query/history').then(convert(queryClient)),
        },

        // 권한관리
        {
          path: paths.app.permissions.request.path,
          lazy: () => import('./routes/app/permissions/request').then(convert(queryClient)),
        },
        {
          path: paths.app.permissions.my.path,
          lazy: () => import('./routes/app/permissions/my').then(convert(queryClient)),
        },
        {
          path: paths.app.permissions.detail.path,
          lazy: () => import('./routes/app/permissions/detail').then(convert(queryClient)),
        },

        // 결재 (APPROVER 이상)
        {
          element: <ApproverGuard />,
          children: [
            {
              path: paths.app.approvals.root.path,
              lazy: () => import('./routes/app/approvals/index').then(convert(queryClient)),
            },
            {
              path: paths.app.approvals.detail.path,
              lazy: () => import('./routes/app/approvals/detail').then(convert(queryClient)),
            },
          ],
        },

        // 관리자 (ADMIN)
        {
          element: <AdminGuard />,
          children: [
            {
              path: paths.app.admin.users.path,
              lazy: () => import('./routes/app/admin/users').then(convert(queryClient)),
            },
            {
              path: paths.app.admin.permissions.path,
              lazy: () => import('./routes/app/admin/permissions').then(convert(queryClient)),
            },
            {
              path: paths.app.admin.audit.path,
              lazy: () => import('./routes/app/admin/audit').then(convert(queryClient)),
            },
          ],
        },
      ],
    },
    {
      path: '/dev/design-tokens',
      lazy: () => import('./routes/dev/design-tokens').then(convert(queryClient)),
    },
    {
      path: '*',
      lazy: () => import('./routes/not-found').then(convert(queryClient)),
    },
  ])

export function AppRouter() {
  const queryClient = useQueryClient()
  const router = useMemo(() => createAppRouter(queryClient), [queryClient])

  return <RouterProvider router={router} />
}
