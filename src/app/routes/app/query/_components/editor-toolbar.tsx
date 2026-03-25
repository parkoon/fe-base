import {
  CheckIcon,
  ChevronDownIcon,
  DatabaseIcon,
  LayersIcon,
  PanelLeftIcon,
  PlayIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LIMIT_OPTIONS, MOCK_DATA_SOURCES, useQueryStore } from '@/stores/query-store'

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

  const selectedDs = MOCK_DATA_SOURCES.find((ds) => ds.id === selectedDataSourceId)

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
            {MOCK_DATA_SOURCES.map((ds) => (
              <DropdownMenuItem
                key={ds.id}
                onClick={() => setDataSource(ds.id)}
              >
                <DatabaseIcon className="text-muted-foreground size-3.5" />
                <span className="flex-1">{ds.name}</span>
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
            {selectedDs?.schemas.map((schema) => (
              <DropdownMenuItem
                key={schema}
                onClick={() => setSchema(schema)}
              >
                <LayersIcon className="text-muted-foreground size-3.5" />
                <span className="flex-1">{schema}</span>
                {schema === selectedSchema && <CheckIcon className="size-3.5" />}
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
