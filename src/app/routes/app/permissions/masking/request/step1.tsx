import { LayersIcon, PencilIcon, TableIcon } from 'lucide-react'

import { AsyncBoundary } from '@/components/errors'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import { MaskingSchemaPicker } from './_components/masking-schema-picker'
import { MaskingTablePicker } from './_components/masking-table-picker'
import { useMaskingRequest } from './_context/masking-request-context'

export function Step1() {
  const { state, actions, isPreFilled, canProceedToStep2 } = useMaskingRequest()

  if (isPreFilled && state.selectedSchema && state.selectedTable) {
    return (
      <div className="space-y-4">
        <div className="bg-muted/40 space-y-3 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <LayersIcon className="text-muted-foreground size-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-xs">Schema</p>
              <p className="truncate font-mono text-sm font-medium">{state.selectedSchema}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-2">
            <TableIcon className="text-muted-foreground size-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground text-xs">테이블</p>
              <p className="truncate font-mono text-sm font-medium">
                {state.selectedTable}
                {state.tableComment && (
                  <span className="text-muted-foreground ml-2 text-xs font-normal">
                    {state.tableComment}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs"
            onClick={() => actions.setSchema('')}
          >
            <PencilIcon className="size-3" />
            직접 선택하기
          </button>
          <Button
            size="lg"
            onClick={() => actions.goToStep(2)}
            disabled={!canProceedToStep2}
          >
            다음
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">Schema</p>
        <AsyncBoundary>
          <MaskingSchemaPicker />
        </AsyncBoundary>
      </div>

      <Separator />

      <div className="space-y-2">
        <p className="text-sm font-medium">테이블 선택</p>
        <MaskingTablePicker />
      </div>

      {state.selectedSchema && state.selectedTable && (
        <div className="flex flex-wrap gap-1 pt-1">
          <Badge
            variant="secondary"
            className="gap-1 font-mono text-xs"
          >
            <TableIcon className="size-3" />
            {state.selectedTable}
          </Badge>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button
          size="lg"
          onClick={() => actions.goToStep(2)}
          disabled={!canProceedToStep2}
        >
          다음
        </Button>
      </div>
    </div>
  )
}
