import type { TableInfo } from '@/types/manual/query'

export const mockTables: Record<string, TableInfo[]> = {
  HDMF_PROD: [
    { tableName: 'TB_MEMBER', tableComment: '조합원 기본정보', hasPermission: true },
    { tableName: 'TB_MEMBER_ADDR', tableComment: '조합원 주소', hasPermission: false },
    { tableName: 'TB_LOAN', tableComment: '대출 원장', hasPermission: true },
    { tableName: 'TB_LOAN_DETAIL', tableComment: '대출 상세', hasPermission: false },
    { tableName: 'TB_DEPOSIT', tableComment: '예탁금 원장', hasPermission: true },
    { tableName: 'TB_SALARY', tableComment: '급여 정보', hasPermission: false },
    { tableName: 'TB_DEPT', tableComment: '부서 정보', hasPermission: true },
    { tableName: 'TB_EMPLOYEE', tableComment: '직원 정보', hasPermission: false },
    { tableName: 'TB_CODE', tableComment: '공통코드', hasPermission: true },
    { tableName: 'TB_CODE_DETAIL', tableComment: '공통코드 상세', hasPermission: true },
  ],
  HDMF_MART: [
    { tableName: 'DM_LOAN_SUMMARY', tableComment: '대출 요약 마트', hasPermission: true },
    { tableName: 'DM_MEMBER_STAT', tableComment: '조합원 통계', hasPermission: false },
    { tableName: 'DM_DEPOSIT_DAILY', tableComment: '일별 예탁금', hasPermission: true },
  ],
  public: [
    { tableName: 'fact_transactions', tableComment: '거래 팩트', hasPermission: true },
    { tableName: 'dim_products', tableComment: '상품 디멘전', hasPermission: true },
    { tableName: 'dim_customers', tableComment: '고객 디멘전', hasPermission: false },
    { tableName: 'agg_monthly_sales', tableComment: '월별 매출 집계', hasPermission: true },
  ],
  marketing: [
    { tableName: 'tb_campaign', tableComment: '캠페인 마스터', hasPermission: true },
    { tableName: 'tb_target_list', tableComment: '대상자 목록', hasPermission: false },
    { tableName: 'tb_response_log', tableComment: '응답 로그', hasPermission: true },
  ],
}

export const mockColumns: Record<
  string,
  { name: string; type: string; comment: string; isMasked: boolean }[]
> = {
  TB_MEMBER: [
    { name: 'MEMBER_ID', type: 'NUMBER(10)', comment: '조합원 ID', isMasked: false },
    { name: 'MEMBER_NAME', type: 'VARCHAR2(50)', comment: '조합원명', isMasked: true },
    { name: 'RESIDENT_NO', type: 'VARCHAR2(13)', comment: '주민등록번호', isMasked: true },
    { name: 'PHONE', type: 'VARCHAR2(15)', comment: '전화번호', isMasked: true },
    { name: 'EMAIL', type: 'VARCHAR2(100)', comment: '이메일', isMasked: false },
    { name: 'JOIN_DATE', type: 'DATE', comment: '가입일', isMasked: false },
    { name: 'STATUS', type: 'VARCHAR2(10)', comment: '상태', isMasked: false },
  ],
  TB_LOAN: [
    { name: 'LOAN_ID', type: 'NUMBER(10)', comment: '대출 ID', isMasked: false },
    { name: 'MEMBER_ID', type: 'NUMBER(10)', comment: '조합원 ID', isMasked: false },
    { name: 'LOAN_TYPE', type: 'VARCHAR2(20)', comment: '대출 유형', isMasked: false },
    { name: 'LOAN_AMOUNT', type: 'NUMBER(15,2)', comment: '대출금액', isMasked: false },
    { name: 'INTEREST_RATE', type: 'NUMBER(5,3)', comment: '이율', isMasked: false },
    { name: 'START_DATE', type: 'DATE', comment: '대출 시작일', isMasked: false },
    { name: 'END_DATE', type: 'DATE', comment: '대출 만기일', isMasked: false },
  ],
}
