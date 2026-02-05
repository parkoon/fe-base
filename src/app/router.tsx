import { createBrowserRouter, RouterProvider } from 'react-router'

import { paths } from '../config/paths'
import { ProtectedRoute } from '../lib/auth'
import AppRoot from './routes/app/root'

const router = createBrowserRouter([
  {
    path: paths.home.path,
    lazy: () => import('./routes/landing'),
  },
  {
    path: paths.auth.login.path,
    lazy: () => import('./routes/auth/login'),
  },
  {
    path: paths.auth.register.path,
    lazy: () => import('./routes/auth/register'),
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
