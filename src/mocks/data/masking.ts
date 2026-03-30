import type { MaskingColumn, MaskingRequest } from '@/types/manual/masking'

export const mockMaskingRequests: MaskingRequest[] = [
  {
    id: 'MKR-2026-001',
    schema: 'HDMF_PROD',
    tableName: 'TB_MEMBER',
    tableComment: '조합원 기본정보',
    columns: ['MEMBER_NAME', 'PHONE'],
    reason: '고객 민원 처리를 위한 실명 및 연락처 확인 필요',
    status: 'PENDING',
    createdAt: '2026-03-25T09:30:00Z',
  },
  {
    id: 'MKR-2026-002',
    schema: 'HDMF_PROD',
    tableName: 'TB_MEMBER',
    tableComment: '조합원 기본정보',
    columns: ['RESIDENT_NO'],
    reason: '대출 심사를 위한 본인 확인 목적',
    status: 'APPROVED',
    createdAt: '2026-03-10T11:00:00Z',
    processedAt: '2026-03-12T14:00:00Z',
  },
  {
    id: 'MKR-2026-003',
    schema: 'HDMF_PROD',
    tableName: 'TB_EMPLOYEE',
    tableComment: '직원 정보',
    columns: ['SALARY', 'SSN'],
    reason: '급여 정산 업무 처리',
    status: 'REJECTED',
    createdAt: '2026-03-05T08:00:00Z',
    processedAt: '2026-03-06T10:00:00Z',
  },
  {
    id: 'MKR-2026-004',
    schema: 'marketing',
    tableName: 'tb_target_list',
    tableComment: '대상자 목록',
    columns: ['PHONE', 'EMAIL'],
    reason: '2분기 캠페인 대상자 연락처 확인',
    status: 'PENDING',
    createdAt: '2026-03-28T13:00:00Z',
  },
]

// 테이블별 마스킹 컬럼 목록 (mockColumns의 isMasked=true 기반)
export const mockMaskingColumnsByTable: Record<string, MaskingColumn[]> = {
  TB_MEMBER: [
    { columnName: 'MEMBER_NAME', columnComment: '조합원명', maskingStatus: 'PENDING' },
    { columnName: 'RESIDENT_NO', columnComment: '주민등록번호', maskingStatus: 'APPROVED' },
    { columnName: 'PHONE', columnComment: '전화번호', maskingStatus: 'PENDING' },
  ],
  TB_EMPLOYEE: [
    { columnName: 'SALARY', columnComment: '급여', maskingStatus: 'NONE' },
    { columnName: 'SSN', columnComment: '주민등록번호', maskingStatus: 'REJECTED' },
  ],
  tb_target_list: [
    { columnName: 'PHONE', columnComment: '전화번호', maskingStatus: 'PENDING' },
    { columnName: 'EMAIL', columnComment: '이메일', maskingStatus: 'NONE' },
    { columnName: 'NAME', columnComment: '이름', maskingStatus: 'NONE' },
  ],
  DM_MEMBER_STAT: [
    { columnName: 'AVG_INCOME', columnComment: '평균 소득', maskingStatus: 'NONE' },
    { columnName: 'CREDIT_SCORE', columnComment: '신용점수', maskingStatus: 'NONE' },
  ],
}

// 쿼리 실행 시 TB_MEMBER 조회 감지용 maskingInfo
export const TB_MEMBER_MASKING_INFO = [
  { columnName: 'MEMBER_NAME', maskingStatus: 'PENDING' as const },
  { columnName: 'RESIDENT_NO', maskingStatus: 'APPROVED' as const },
  { columnName: 'PHONE', maskingStatus: 'PENDING' as const },
]

let mockMaskingCounter = mockMaskingRequests.length

export function addMockMaskingRequest(
  data: Omit<MaskingRequest, 'id' | 'createdAt' | 'status'>
): MaskingRequest {
  mockMaskingCounter++
  const newRequest: MaskingRequest = {
    ...data,
    id: `MKR-2026-${String(mockMaskingCounter).padStart(3, '0')}`,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  }
  mockMaskingRequests.push(newRequest)
  return newRequest
}

export function getMockMaskingRequests(status?: string): MaskingRequest[] {
  if (!status || status === 'ALL') return [...mockMaskingRequests]
  return mockMaskingRequests.filter((r) => r.status === status)
}
