function PermissionRequestPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">권한 신청</h1>
      <p className="text-muted-foreground mt-1">테이블 검색 후 권한을 신청할 수 있습니다.</p>
    </div>
  )
}

export const handle = {
  breadcrumb: '권한 신청',
}

export default PermissionRequestPage
