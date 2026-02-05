import { Link } from 'react-router'

import { paths } from '../../config/paths'

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-xl text-gray-600">페이지를 찾을 수 없습니다</p>
        <Link
          to={paths.home.path}
          className="mt-8 inline-block rounded-lg bg-blue-500 px-6 py-3 text-white hover:bg-blue-600"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}

export const Component = NotFoundPage
