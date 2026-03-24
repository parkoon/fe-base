import { queryOptions } from '@tanstack/react-query'

import type { DataSource } from '@/types/manual/datasource'

import { querypie } from '../querypie'

export const getDatasourcesService = () =>
  querypie.instance.get<DataSource[]>('/api/datasources').then((res) => res.data)

export const getDatasourcesQueryOptions = () =>
  queryOptions({
    queryKey: ['getDatasources'],
    queryFn: getDatasourcesService,
  })
