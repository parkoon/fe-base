import { type QueryClient, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'

import { paths } from '@/config/paths'
import { ProtectedRoute, PublicRoute } from '@/lib/auth'

import AppRoot from './routes/app/root'
import { Component as AuthLogin } from './routes/auth/login'
import { Component as AuthRegister } from './routes/auth/register'

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
      path: paths.auth.register.path,
      element: (
        <PublicRoute>
          <AuthRegister />
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
        {
          path: paths.app.dashboard.path,
          lazy: () => import('./routes/app/dashboard').then(convert(queryClient)),
        },
        {
          path: paths.app.settings.path,
          lazy: () => import('./routes/app/settings').then(convert(queryClient)),
        },
        {
          path: paths.app.todos.path,
          lazy: () => import('./routes/app/todos').then(convert(queryClient)),
        },
      ],
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
