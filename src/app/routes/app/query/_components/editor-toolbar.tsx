import { useQuery } from '@tanstack/react-query'
import {
  CheckIcon,
  ChevronDownIcon,
  DatabaseIcon,
  LayersIcon,
  PanelLeftIcon,
  PlayIcon,
} from 'lucide-react'

import { getDatasourceSchemasQueryOptions } from '@/api/datasources/get-datasource-schemas'
import { getDatasourcesQueryOptions } from '@/api/datasources/get-datasources'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LIMIT_OPTIONS, useQueryStore } from '@/stores/query-store'

export function EditorToolbar({
  sidebarOpen,
  onToggleSidebar,
  onRun,
  isRunning,
}: {
  sidebarOpen: boolean
  onToggleSidebar: () => void
  onRun: () => void
  isRunning: boolean
}) {
  const {
    selectedDataSourceId,
    selectedSchema,
    limitRows,
    setDataSource,
    setSchema,
    setLimitRows,
  } = useQueryStore()

  const { data: datasources = [] } = useQuery(getDatasourcesQueryOptions())
  const { data: schemas = [] } = useQuery(
    getDatasourceSchemasQueryOptions(selectedDataSourceId ?? 0)
  )

  const selectedDs = datasources.find((ds) => ds.id === selectedDataSourceId)

  return (
    <div className="flex h-11 shrink-0 items-center justify-between border-b px-3">
      {/* Left: Sidebar toggle + DataSource / Schema selectors */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onToggleSidebar}
        >
          <PanelLeftIcon
            className={`size-4 ${sidebarOpen ? 'text-foreground' : 'text-muted-foreground'}`}
          />
        </Button>
        <div className="bg-border mx-1 h-4 w-px" />

        {/* DataSource selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="hover:bg-accent flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors"
            >
              <DatabaseIcon className="text-muted-foreground size-3.5" />
              <span className="text-muted-foreground text-xs">DataSource</span>
              <span className="max-w-[120px] truncate font-medium">
                {selectedDs?.name ?? '선택하세요'}
              </span>
              <ChevronDownIcon className="text-muted-foreground size-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {datasources.map((ds) => (
              <DropdownMenuItem
                key={ds.id}
                onClick={() => setDataSource(ds.id)}
                disabled={ds.status === 'INACTIVE'}
              >
                <DatabaseIcon className="text-muted-foreground size-3.5" />
                <span className="flex-1">{ds.name}</span>
                {ds.status === 'INACTIVE' && (
                  <span className="text-muted-foreground text-[10px]">비활성</span>
                )}
                {ds.id === selectedDataSourceId && <CheckIcon className="size-3.5" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="text-muted-foreground/40 text-xs">/</span>

        {/* Schema selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              disabled={!selectedDs}
              className="hover:bg-accent flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <LayersIcon className="text-muted-foreground size-3.5" />
              <span className="text-muted-foreground text-xs">Schema</span>
              <span className="max-w-[120px] truncate font-medium">
                {selectedSchema ?? '선택하세요'}
              </span>
              <ChevronDownIcon className="text-muted-foreground size-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {schemas.map((schema) => (
              <DropdownMenuItem
                key={schema.name}
                onClick={() => setSchema(schema.name)}
              >
                <LayersIcon className="text-muted-foreground size-3.5" />
                <span className="flex-1">{schema.name}</span>
                <span className="text-muted-foreground text-[10px]">{schema.tableCount}개</span>
                {schema.name === selectedSchema && <CheckIcon className="size-3.5" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: Limit + Run */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="hover:bg-accent flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors"
            >
              <span className="font-medium">
                {limitRows === 0 ? 'No limit' : `${limitRows} rows`}
              </span>
              <ChevronDownIcon className="text-muted-foreground size-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {LIMIT_OPTIONS.map((limit) => (
              <DropdownMenuItem
                key={limit}
                onClick={() => setLimitRows(limit)}
              >
                <span className="flex-1">{limit === 0 ? 'No limit' : `${limit} rows`}</span>
                {limit === limitRows && <CheckIcon className="size-3.5" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          className="gap-1.5 px-4 font-medium"
          onClick={onRun}
          disabled={isRunning}
        >
          <PlayIcon className="size-3.5 fill-current" />
          {isRunning ? '실행 중...' : '실행'}
          <kbd className="bg-primary-foreground/20 ml-1 rounded px-1 py-0.5 text-[10px] font-normal">
            ⌘↵
          </kbd>
        </Button>
      </div>
    </div>
  )
}
