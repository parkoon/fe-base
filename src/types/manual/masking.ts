// 마스킹 권한 관련 타입 (백엔드 OpenAPI 스펙 확정 전 수동 정의)

export type MaskingPermissionStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'

export type MaskingStatusLabel = {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  color: string
}

export const MASKING_STATUS_MAP: Record<MaskingPermissionStatus, MaskingStatusLabel> = {
  NONE: {
    label: '없음',
    variant: 'outline',
    color: 'text-muted-foreground bg-muted border-muted',
  },
  PENDING: {
    label: '승인 대기',
    variant: 'outline',
    color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  },
  APPROVED: {
    label: '승인됨',
    variant: 'default',
    color: 'text-green-600 bg-green-50 border-green-200',
  },
  REJECTED: {
    label: '거절됨',
    variant: 'destructive',
    color: 'text-red-600 bg-red-50 border-red-200',
  },
}

export type MaskingColumn = {
  columnName: string
  columnComment: string
  maskingStatus: MaskingPermissionStatus
}

export type MaskingRequest = {
  id: string
  schema: string
  tableName: string
  tableComment: string
  columns: string[]
  reason: string
  status: MaskingPermissionStatus
  createdAt: string
  processedAt?: string
}

export type MaskingRequestForm = {
  schema: string
  tableName: string
  columns: string[]
  reason: string
}
