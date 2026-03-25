import { useQueries, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { getDatasourceColumnsQueryOptions } from '@/api/datasources/get-datasource-columns'
import { getDatasourceTablesQueryOptions } from '@/api/datasources/get-datasource-tables'
import { useQueryStore } from '@/stores/query-store'

/**
 * 선택된 DataSource/Schema의 테이블+컬럼 메타데이터를 CodeMirror schema 형태로 반환
 * @returns Record<string, string[]> — { TABLE_NAME: ['COL1', 'COL2', ...] }
 */
export function useSchemaMetadata() {
  const { selectedDataSourceId, selectedSchema } = useQueryStore()

  const dsId = selectedDataSourceId ?? 0
  const schema = selectedSchema ?? ''

  const { data: tables = [] } = useQuery(getDatasourceTablesQueryOptions(dsId, schema))

  const permittedTables = useMemo(() => tables.filter((t) => t.hasPermission), [tables])

  const columnQueries = useQueries({
    queries: permittedTables.map((t) =>
      getDatasourceColumnsQueryOptions(dsId, schema, t.tableName)
    ),
  })

  const schemaMap = useMemo(() => {
    const map: Record<string, string[]> = {}
    permittedTables.forEach((table, i) => {
      const columns = columnQueries[i]?.data
      map[table.tableName] = columns ? columns.map((c) => c.name) : []
    })
    return map
  }, [permittedTables, columnQueries])

  return schemaMap
}
