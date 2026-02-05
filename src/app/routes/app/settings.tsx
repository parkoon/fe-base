function SettingsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold">설정</h2>
      <p className="mt-2 text-gray-600">애플리케이션 설정을 관리합니다.</p>

      <div className="mt-6 space-y-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold">알림 설정</h3>
          <p className="mt-2 text-sm text-gray-500">이메일 및 푸시 알림을 관리합니다.</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold">보안 설정</h3>
          <p className="mt-2 text-sm text-gray-500">비밀번호 및 2FA 설정을 관리합니다.</p>
        </div>
      </div>
    </div>
  )
}

export const Component = SettingsPage
