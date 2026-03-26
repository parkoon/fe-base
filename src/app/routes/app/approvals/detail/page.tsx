import { useParams } from 'react-router'

function ApprovalDetailPage() {
  const { id } = useParams()

  return (
    <div>
      <h1 className="text-2xl font-semibold">결재 상세</h1>
      <p className="text-muted-foreground mt-1">결재 ID: {id}</p>
    </div>
  )
}

export default ApprovalDetailPage
