import { Link, useNavigate, useSearchParams } from 'react-router'

import { paths } from '../../../config/paths'
import { useAuthStore } from '../../../lib/auth'

function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')
  const setUser = useAuthStore((s) => s.setUser)

  const handleLogin = () => {
    setUser({ id: '1', email: 'test@test.com', name: 'Test User' })
    void navigate(redirectTo ?? paths.app.dashboard.getHref(), { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold">로그인</h2>
        <button
          onClick={handleLogin}
          className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          테스트 로그인
        </button>
        <p className="mt-4 text-center text-sm text-gray-600">
          계정이 없으신가요?{' '}
          <Link
            to={paths.auth.register.path}
            className="text-blue-500 hover:underline"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}

export const Component = LoginPage
