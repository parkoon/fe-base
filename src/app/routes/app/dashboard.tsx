import { useAuthStore } from '@/lib/auth'

function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div>
      <h2 className="text-2xl font-bold">대시보드</h2>
      <p className="mt-2 text-gray-600">
        환영합니다, <span className="font-semibold">{user?.name}</span>님!
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold">통계 1</h3>
          <p className="mt-2 text-3xl font-bold text-blue-500">123</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold">통계 2</h3>
          <p className="mt-2 text-3xl font-bold text-green-500">456</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold">통계 3</h3>
          <p className="mt-2 text-3xl font-bold text-purple-500">789</p>
        </div>
      </div>
    </div>
  )
}

export const Component = DashboardPage
