function AdminUsersPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">사용자 관리</h1>
      <p className="text-muted-foreground mt-1">사용자 검색 및 역할을 관리합니다.</p>
    </div>
  )
}

export const handle = {
  breadcrumb: '사용자 관리',
}

export default AdminUsersPage
