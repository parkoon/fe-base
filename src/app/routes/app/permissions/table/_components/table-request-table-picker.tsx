import { useSuspenseQuery } from '@tanstack/react-query'
import { CheckIcon, TableIcon } from 'lucide-react'

import { getDatasourceTablesQueryOptions } from '@/api/datasources/get-datasource-tables'
import { cn } from '@/lib/utils'

import { useTablePermissionRequest } from '../_context/table-request-context'

export function TableRequestTablePicker() {
  const { state, actions } = useTablePermissionRequest()

  if (!state.selectedSchema) {
    return (
      <div className="text-muted-foreground rounded-lg border py-10 text-center text-sm">
        스키마를 선택하면 테이블 목록이 표시됩니다
      </div>
    )
  }

  return (
    <TableList
      datasourceId={state.selectedSchema.datasourceId}
      schemaName={state.selectedSchema.schemaName}
      selectedTables={state.selectedTables}
      onToggleTable={actions.toggleTable}
    />
  )
}

type TableListProps = {
  datasourceId: number
  schemaName: string
  selectedTables: { tableName: string; tableComment: string }[]
  onToggleTable: (table: { tableName: string; tableComment: string }) => void
}

function TableList({ datasourceId, schemaName, selectedTables, onToggleTable }: TableListProps) {
  const tablesQuery = useSuspenseQuery(getDatasourceTablesQueryOptions(datasourceId, schemaName))

  const isSelected = (tableName: string) => selectedTables.some((t) => t.tableName === tableName)

  return (
    <div className="rounded-lg border">
      <ul className="max-h-[360px] overflow-y-auto">
        {tablesQuery.data.length === 0 ? (
          <li className="text-muted-foreground py-6 text-center text-sm">테이블이 없습니다</li>
        ) : (
          tablesQuery.data.map((table) => {
            const selected = isSelected(table.tableName)
            return (
              <li key={table.tableName}>
                <button
                  type="button"
                  onClick={() =>
                    onToggleTable({
                      tableName: table.tableName,
                      tableComment: table.tableComment,
                    })
                  }
                  className="hover:bg-accent flex w-full items-center gap-3 px-3 py-2"
                >
                  <div
                    className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded-sm border',
                      selected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted-foreground/30'
                    )}
                  >
                    {selected && <CheckIcon className="size-3" />}
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
      {selectedTables.length > 0 && (
        <div className="bg-muted/30 border-t px-3 py-2">
          <p className="text-muted-foreground text-xs">{selectedTables.length}개 테이블 선택됨</p>
        </div>
      )}
    </div>
  )
}
