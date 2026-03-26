import { PanelLeftIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

import { DataSourceSelect } from './datasource-select'
import { LimitSelect } from './limit-select'
import { SaveQueryDialog } from './save-query-dialog'
import { SchemaSelect } from './schema-select'

export function EditorToolbar({
  sidebarOpen,
  onToggleSidebar,
  onRun,
  isRunning,
  onSave,
  isSaving,
}: {
  sidebarOpen: boolean
  onToggleSidebar: () => void
  onRun: () => void
  isRunning: boolean
  onSave: (name: string, memo?: string) => void
  isSaving: boolean
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogKey, setDialogKey] = useState(0)

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

        <DataSourceSelect />

        <span className="text-muted-foreground/40 text-xs">/</span>

        <SchemaSelect />
      </div>

      {/* Right: Limit + Run */}
      <div className="flex items-center gap-2">
        <LimitSelect />

        <Button
          variant="outline"
          onClick={() => {
            setDialogKey((k) => k + 1)
            setDialogOpen(true)
          }}
        >
          저장
        </Button>

        <Button
          className="flex items-center"
          onClick={onRun}
          disabled={isRunning}
        >
          {isRunning ? '실행 중...' : '실행'}
          <span className="text-[12px] font-normal">CTRL ↵</span>
        </Button>
      </div>

      <SaveQueryDialog
        key={dialogKey}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={(name, memo) => {
          onSave(name, memo)
          setDialogOpen(false)
        }}
        isSaving={isSaving}
      />
    </div>
  )
}
