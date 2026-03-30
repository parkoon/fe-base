import type { SchemaInfo } from '@/types/manual/query'

export const mockSchemas: SchemaInfo[] = [
  { name: 'HDMF_PROD', tableCount: 128 },
  { name: 'HDMF_MART', tableCount: 45 },
  { name: 'HDMF_STG', tableCount: 32 },
  { name: 'public', tableCount: 67 },
  { name: 'analytics', tableCount: 23 },
  { name: 'marketing', tableCount: 41 },
  { name: 'campaign', tableCount: 18 },
  { name: 'dbo', tableCount: 95 },
]
