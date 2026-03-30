import { useQuery } from '@tanstack/react-query'
import { TableIcon } from 'lucide-react'

import { getSchemaTablesQueryOptions } from '@/api/schemas/get-schema-tables'
import { cn } from '@/lib/utils'

import { useMaskingRequest } from '../_context/masking-request-context'

export function MaskingTablePicker() {
  const { state, actions } = useMaskingRequest()

  // enabled: false when no schema → useQuery (not useSuspenseQuery)
  const tablesQuery = useQuery({
    ...getSchemaTablesQueryOptions(state.selectedSchema ?? ''),
    enabled: state.selectedSchema !== null,
  })

  if (!state.selectedSchema) {
    return (
      <div className="text-muted-foreground rounded-lg border py-10 text-center text-sm">
        스키마를 선택하면 테이블 목록이 표시됩니다
      </div>
    )
  }

  if (tablesQuery.isLoading) {
    return (
      <div className="rounded-lg border">
        <ul>
          {Array.from({ length: 4 }).map((_, i) => (
            <li
              key={i}
              className="bg-muted/40 mx-3 my-2 h-8 animate-pulse rounded"
            />
          ))}
        </ul>
      </div>
    )
  }

  const tables = tablesQuery.data ?? []

  return (
    <div className="rounded-lg border">
      <ul className="max-h-[360px] overflow-y-auto">
        {tables.length === 0 ? (
          <li className="text-muted-foreground py-6 text-center text-sm">테이블이 없습니다</li>
        ) : (
          tables.map((table) => {
            const isSelected = state.selectedTable === table.tableName
            return (
              <li key={table.tableName}>
                <button
                  type="button"
                  onClick={() => actions.setTable(table.tableName, table.tableComment)}
                  className="hover:bg-accent flex w-full items-center gap-3 px-3 py-2"
                >
                  <div
                    className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded-full border-2',
                      isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                    )}
                  >
                    {isSelected && <div className="bg-primary-foreground size-1.5 rounded-full" />}
                  </div>
                  <TableIcon className="text-muted-foreground size-4 shrink-0" />
                  <div className="min-w-0 flex-1 text-left">
                    <span className="font-mono text-sm">{table.tableName}</span>
                    {table.tableComment && (
                      <span className="text-muted-foreground ml-2 text-xs">
                        {table.tableComment}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}
