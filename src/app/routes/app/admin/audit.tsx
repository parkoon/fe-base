function AdminAuditPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">감사 로그</h1>
      <p className="text-muted-foreground mt-1">접속 및 쿼리 실행 로그를 조회합니다.</p>
    </div>
  )
}

export const handle = {
  breadcrumb: '감사 로그',
}

export default AdminAuditPage
