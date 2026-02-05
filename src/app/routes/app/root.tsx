import { Link, Outlet, useNavigate } from 'react-router'

import { paths } from '@/config/paths'
import { useAuthStore } from '@/lib/auth'

function AppRoot() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const handleLogout = () => {
    logout()
    void navigate(paths.home.path)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.firstName}</span>
            <button
              onClick={handleLogout}
              className="rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl gap-4 px-4">
          <Link
            to={paths.app.dashboard.getHref()}
            className="border-b-2 border-transparent px-3 py-3 text-sm hover:border-blue-500 [&.active]:border-blue-500 [&.active]:font-semibold"
          >
            대시보드
          </Link>
          <Link
            to={paths.app.settings.getHref()}
            className="border-b-2 border-transparent px-3 py-3 text-sm hover:border-blue-500 [&.active]:border-blue-500 [&.active]:font-semibold"
          >
            설정
          </Link>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

export default AppRoot
