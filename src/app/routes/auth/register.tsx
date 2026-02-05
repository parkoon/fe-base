import { Link } from 'react-router'

import { paths } from '@/config/paths'

function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold">회원가입</h2>
        <p className="text-center text-gray-600">회원가입 폼이 여기에 들어갑니다.</p>
        <p className="mt-4 text-center text-sm text-gray-600">
          이미 계정이 있으신가요?{' '}
          <Link
            to={paths.auth.login.path}
            className="text-blue-500 hover:underline"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}

export const Component = RegisterPage
