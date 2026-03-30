import { queryOptions } from '@tanstack/react-query'

import type { MaskingColumn } from '@/types/manual/masking'

import { querypie } from '../../querypie'

export const getMaskingColumnsService = (schema: string, tableName: string) =>
  querypie.instance
    .get<MaskingColumn[]>('/api/permissions/masking/columns', { params: { schema, tableName } })
    .then((res) => res.data)

export const getMaskingColumnsQueryOptions = (schema: string, tableName: string) =>
  queryOptions({
    queryKey: ['getMaskingColumns', schema, tableName],
    queryFn: () => getMaskingColumnsService(schema, tableName),
    enabled: schema.length > 0 && tableName.length > 0,
  })
