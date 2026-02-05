import { createBrowserRouter, RouterProvider } from 'react-router'

import { paths } from '@/config/paths'
import { ProtectedRoute, PublicRoute } from '@/lib/auth'

import AppRoot from './routes/app/root'
import { Component as AuthLogin } from './routes/auth/login'
import { Component as AuthRegister } from './routes/auth/register'

const router = createBrowserRouter([
  {
    path: paths.home.path,
    lazy: () => import('./routes/landing'),
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
        lazy: () => import('./routes/app/dashboard'),
      },
      {
        path: paths.app.settings.path,
        lazy: () => import('./routes/app/settings'),
      },
      {
        path: paths.app.todos.path,
        lazy: () => import('./routes/app/todos'),
      },
    ],
  },
  {
    path: '*',
    lazy: () => import('./routes/not-found'),
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
