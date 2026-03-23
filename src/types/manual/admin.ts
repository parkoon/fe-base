// 관리자 관련 타입 (백엔드 OpenAPI 스펙 확정 전 수동 정의)

import type { UserRole } from '@/lib/auth'

export type UserInfo = {
  id: string
  employeeId: string
  name: string
  department: string
  email: string
  role: UserRole
  lastLoginAt?: string
}

export type PermissionStatus = {
  userId: string
  userName: string
  department: string
  tableName: string
  tableComment: string
  role: UserRole
  hasMaskingOverride: boolean
  expiresAt: string
}

export type AuditLog = {
  id: string
  userId: string
  userName: string
  action: 'LOGIN' | 'LOGOUT' | 'QUERY_EXECUTE' | 'PERMISSION_REQUEST' | 'APPROVAL'
  detail: string
  ipAddress: string
  createdAt: string
}
