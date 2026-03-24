import { useQuery } from '@tanstack/react-query'
import { CheckIcon, Loader2Icon, SearchIcon, TableIcon } from 'lucide-react'
import { useState } from 'react'

import { getDatasourceTablesQueryOptions } from '@/api/datasources/get-datasource-tables'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'

type TableSearchComboboxProps = {
  datasourceId: number
  schema: string
  selectedTables: { tableName: string; tableComment: string }[]
  onToggleTable: (table: { tableName: string; tableComment: string }) => void
  disabled?: boolean
}

export function TableSearchCombobox({
  datasourceId,
  schema,
  selectedTables,
  onToggleTable,
  disabled,
}: TableSearchComboboxProps) {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const { data: tables, isLoading } = useQuery(
    getDatasourceTablesQueryOptions(datasourceId, schema)
  )

  const filteredTables = (tables ?? []).filter((t) => {
    if (!debouncedSearch) return true
    const q = debouncedSearch.toLowerCase()
    return t.tableName.toLowerCase().includes(q) || t.tableComment.toLowerCase().includes(q)
  })

  const isSelected = (tableName: string) => selectedTables.some((t) => t.tableName === tableName)

  return (
    <div className="rounded-lg border">
      <Command shouldFilter={false}>
        <div className="flex items-center border-b px-3">
          <SearchIcon className="text-muted-foreground mr-2 size-4 shrink-0" />
          <CommandInput
            placeholder="테이블명 또는 한글명으로 검색..."
            value={search}
            onValueChange={setSearch}
            disabled={disabled}
            className="border-0 ring-0 focus:ring-0"
          />
        </div>
        <CommandList className="max-h-[240px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2Icon className="text-muted-foreground size-5 animate-spin" />
            </div>
          ) : filteredTables.length === 0 ? (
            <CommandEmpty>검색 결과가 없습니다</CommandEmpty>
          ) : (
            <CommandGroup>
              {filteredTables.map((table) => {
                const selected = isSelected(table.tableName)
                return (
                  <CommandItem
                    key={table.tableName}
                    value={table.tableName}
                    onSelect={() =>
                      onToggleTable({
                        tableName: table.tableName,
                        tableComment: table.tableComment,
                      })
                    }
                    className="flex items-center gap-3 px-3 py-2"
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
                    <div className="min-w-0 flex-1">
                      <span className="font-mono text-sm">{table.tableName}</span>
                      {table.tableComment && (
                        <span className="text-muted-foreground ml-2 text-xs">
                          {table.tableComment}
                        </span>
                      )}
                    </div>
                    {!table.hasPermission && (
                      <span className="rounded bg-yellow-50 px-1.5 py-0.5 text-xs text-yellow-600">
                        신규
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
      {selectedTables.length > 0 && (
        <div className="bg-muted/30 border-t px-3 py-2">
          <p className="text-muted-foreground text-xs">{selectedTables.length}개 테이블 선택됨</p>
        </div>
      )}
    </div>
  )
}
