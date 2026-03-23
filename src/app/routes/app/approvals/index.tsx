function ApprovalsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">결재 대기함</h1>
      <p className="text-muted-foreground mt-1">승인 또는 반려할 결재 건을 확인합니다.</p>
    </div>
  )
}

export const handle = {
  breadcrumb: '결재 대기함',
}

export default ApprovalsPage
