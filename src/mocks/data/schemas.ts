import type { SchemaInfo } from '@/types/manual/datasource'

export const mockSchemas: Record<number, SchemaInfo[]> = {
  // 정보계-Oracle
  1: [
    { name: 'HDMF_PROD', tableCount: 128 },
    { name: 'HDMF_MART', tableCount: 45 },
    { name: 'HDMF_STG', tableCount: 32 },
  ],
  // 분석계-PostgreSQL
  2: [
    { name: 'public', tableCount: 67 },
    { name: 'analytics', tableCount: 23 },
  ],
  // 마케팅-MySQL
  3: [
    { name: 'marketing', tableCount: 41 },
    { name: 'campaign', tableCount: 18 },
  ],
  // 레거시-MSSQL
  4: [{ name: 'dbo', tableCount: 95 }],
}
