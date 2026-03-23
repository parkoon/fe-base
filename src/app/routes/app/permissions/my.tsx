function MyPermissionsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">내 신청 목록</h1>
      <p className="text-muted-foreground mt-1">권한 신청 내역과 결재 진행 상태를 확인합니다.</p>
    </div>
  )
}

export const handle = {
  breadcrumb: '내 신청 목록',
}

export default MyPermissionsPage
