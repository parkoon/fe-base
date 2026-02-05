import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'

import { usePostAuthLoginMutation } from '@/api/auth'
import { paths } from '@/config/paths'
import { getErrorMessage } from '@/lib/api'
import { useAuthStore } from '@/lib/auth'

function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')
  const setUser = useAuthStore((s) => s.setUser)

  const [username, setUsername] = useState('emilys')
  const [password, setPassword] = useState('emilyspass')
  const [error, setError] = useState<string | null>(null)

  const login = usePostAuthLoginMutation({
    mutationConfig: {
      onSuccess: (data) => {
        setUser(data)
        void navigate(redirectTo ?? paths.app.dashboard.getHref(), {
          replace: true,
        })
      },
      onError: (err) => {
        setError(getErrorMessage(err))
      },
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    login.mutate({ username, password, expiresInMins: 60 })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold">로그인</h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {error && <div className="rounded bg-red-100 p-3 text-sm text-red-600">{error}</div>}

          <div>
            <label
              htmlFor="username"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="emilys"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="emilyspass"
              required
            />
          </div>

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {login.isPending ? '로그인 중...' : '로그인'}
          </button>

          <p className="text-center text-xs text-gray-500">테스트 계정: emilys / emilyspass</p>
        </form>

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
