import { useState } from 'react'
import { toast } from 'sonner'

import { useCreateQueryMutation } from '@/api/queries/create-query'
import { Button } from '@/components/ui/button'

import { LimitSelect } from './limit-select'
import { SaveQueryDialog } from './save-query-dialog'
import { SchemaSelect } from './schema-select'

type EditorToolbarProps = {
  sql: string
  onRun: () => void
  isRunning: boolean
}
export function EditorToolbar({ sql, onRun, isRunning }: EditorToolbarProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const createQueryMutation = useCreateQueryMutation()

  const handleSave = (name: string, memo?: string, onSuccess?: () => void) => {
    createQueryMutation.mutate(
      { name, sql, memo },
      {
        onSuccess: (saved) => {
          toast(`"${saved.name}" 쿼리가 저장되었습니다.`)
          onSuccess?.()
        },
      }
    )
  }

  return (
    <div className="flex h-11 shrink-0 items-center justify-between border-b px-3">
      {/* Left: Schema selector */}
      <div className="flex items-center gap-2">
        <SchemaSelect />
      </div>

      {/* Right: Limit + Run */}
      <div className="flex items-center gap-2">
        <LimitSelect />

        <Button
          variant="outline"
          onClick={() => {
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
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={(name, memo) => {
          handleSave(name, memo)
          setDialogOpen(false)
        }}
        isSaving={createQueryMutation.isPending}
      />
    </div>
  )
}
