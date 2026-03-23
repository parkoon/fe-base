// 권한 관련 타입 (백엔드 OpenAPI 스펙 확정 전 수동 정의)

export type ApprovalStatus =
  | 'PENDING_FIRST'
  | 'FIRST_APPROVED'
  | 'PENDING_SECOND'
  | 'FINAL_APPROVED'
  | 'REJECTED'

export type PermissionRequest = {
  id: string
  tableName: string
  tableComment: string
  reason: string
  columns: string[]
  startDate: string
  endDate: string
  status: ApprovalStatus
  createdAt: string
  updatedAt: string
}

export type ApprovalStep = {
  step: number
  approverName: string
  approverDepartment: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  comment?: string
  processedAt?: string
}

export type PermissionRequestDetail = PermissionRequest & {
  requesterName: string
  requesterDepartment: string
  approvalSteps: ApprovalStep[]
}
