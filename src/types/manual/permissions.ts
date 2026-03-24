// 권한 관련 타입 (백엔드 OpenAPI 스펙 확정 전 수동 정의)

export type ApprovalStatus =
  | 'PENDING_FIRST'
  | 'FIRST_APPROVED'
  | 'PENDING_SECOND'
  | 'FINAL_APPROVED'
  | 'REJECTED'

export type ApprovalStatusLabel = {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  color: string
}

export const APPROVAL_STATUS_MAP: Record<ApprovalStatus, ApprovalStatusLabel> = {
  PENDING_FIRST: {
    label: '1차 대기',
    variant: 'outline',
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  },
  FIRST_APPROVED: {
    label: '1차 승인',
    variant: 'secondary',
    color: 'text-blue-600 bg-blue-50 border-blue-200',
  },
  PENDING_SECOND: {
    label: '2차 대기',
    variant: 'outline',
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  },
  FINAL_APPROVED: {
    label: '최종 승인',
    variant: 'default',
    color: 'text-green-600 bg-green-50 border-green-200',
  },
  REJECTED: {
    label: '반려',
    variant: 'destructive',
    color: 'text-red-600 bg-red-50 border-red-200',
  },
}

export type PermissionRequest = {
  id: string
  datasourceId: number
  datasourceName: string
  schema: string
  tableName: string
  tableComment: string
  reason: string
  startDate: string
  endDate: string
  status: ApprovalStatus
  createdAt: string
  updatedAt: string
}

export type PermissionRequestForm = {
  datasourceId: number
  schema: string
  tables: { tableName: string; tableComment: string }[]
  reason: string
  startDate: string
  endDate: string
}

export type ApprovalStep = {
  step: number
  stepLabel: string
  approverName: string
  approverDepartment: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  comment?: string
  processedAt?: string
}

export type PermissionRequestDetail = PermissionRequest & {
  requesterName: string
  requesterDepartment: string
  requesterEmployeeId: string
  approvalSteps: ApprovalStep[]
}
