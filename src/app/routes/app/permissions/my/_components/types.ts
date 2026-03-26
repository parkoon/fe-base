import type { ApprovalStatus } from '@/types/manual/permissions'

export type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

export const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'PENDING', label: '대기중' },
  { value: 'APPROVED', label: '승인' },
  { value: 'REJECTED', label: '반려' },
]

export function matchesFilter(status: ApprovalStatus, filter: StatusFilter): boolean {
  if (filter === 'ALL') return true
  if (filter === 'PENDING') return status === 'PENDING_FIRST' || status === 'PENDING_SECOND'
  if (filter === 'APPROVED') return status === 'FIRST_APPROVED' || status === 'FINAL_APPROVED'
  return status === 'REJECTED'
}
