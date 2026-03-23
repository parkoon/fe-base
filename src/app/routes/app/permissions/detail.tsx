import { useParams } from 'react-router'

function PermissionDetailPage() {
  const { id } = useParams()

  return (
    <div>
      <h1 className="text-2xl font-semibold">신청 상세</h1>
      <p className="text-muted-foreground mt-1">신청 ID: {id}</p>
    </div>
  )
}

export const handle = {
  breadcrumb: '신청 상세',
}

export default PermissionDetailPage
