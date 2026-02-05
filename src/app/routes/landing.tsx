import { Link } from 'react-router'

import { paths } from '@/config/paths'

function LandingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900">Welcome!</h1>
        <p className="mt-4 text-xl text-gray-600">fe-base 프로젝트에 오신 것을 환영합니다</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to={paths.auth.login.path}
            className="rounded-lg bg-blue-500 px-6 py-3 text-white hover:bg-blue-600"
          >
            로그인
          </Link>
          <Link
            to={paths.auth.register.path}
            className="rounded-lg border border-blue-500 px-6 py-3 text-blue-500 hover:bg-blue-50"
          >
            회원가입
          </Link>
        </div>
      </div>
    </div>
  )
}

export const Component = LandingPage
