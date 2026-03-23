function QueryHistoryPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">실행 이력</h1>
      <p className="text-muted-foreground mt-1">SQL 실행 이력을 조회합니다.</p>
    </div>
  )
}

export const handle = {
  breadcrumb: '실행 이력',
}

export default QueryHistoryPage
