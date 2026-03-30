import { TableIcon } from 'lucide-react'

import { AsyncBoundary } from '@/components/errors'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import { MaskingSchemaPicker } from './_components/masking-schema-picker'
import { MaskingTablePicker } from './_components/masking-table-picker'
import { useMaskingRequest } from './_context/masking-request-context'

export function Step1() {
  const { state, actions, canProceedToStep2 } = useMaskingRequest()

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
