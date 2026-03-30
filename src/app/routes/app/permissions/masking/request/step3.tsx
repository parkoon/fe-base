import { ColumnsIcon, LayersIcon, TableIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

import { useMaskingRequest } from './_context/masking-request-context'

export function Step3() {
  const { state, actions, canSubmit, isSubmitting } = useMaskingRequest()

  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <div className="bg-muted/40 space-y-3 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <LayersIcon className="text-muted-foreground size-4 shrink-0" />
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs">Schema</p>
            <p className="truncate font-mono text-sm font-medium">{state.selectedSchema}</p>
          </div>
        </div>
        <Separator />
        <div className="flex items-center gap-2">
          <TableIcon className="text-muted-foreground size-4 shrink-0" />
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs">테이블</p>
            <p className="truncate font-mono text-sm font-medium">{state.selectedTable}</p>
          </div>
        </div>
        <Separator />
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <ColumnsIcon className="text-muted-foreground size-4 shrink-0" />
            <p className="text-muted-foreground text-xs">
              컬럼 {state.selectedColumns.length}개 선택됨
            </p>
          </div>
          <div className="flex flex-wrap gap-1">
            {state.selectedColumns.map((col) => (
              <Badge
                key={col}
                variant="secondary"
                className="font-mono text-xs"
              >
                {col}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* 사유 입력 */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          신청 사유 <span className="text-destructive">*</span>
        </label>
        <Textarea
          placeholder="마스킹 컬럼에 접근해야 하는 업무 목적과 사유를 입력하세요."
          value={state.reason}
          onChange={(e) => actions.setReason(e.target.value)}
          className="min-h-[100px] resize-none"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          size="lg"
          onClick={() => actions.goToStep(2)}
        >
          이전
        </Button>
        <Button
          size="lg"
          onClick={actions.submit}
          disabled={!canSubmit || isSubmitting}
        >
          신청하기
        </Button>
      </div>
    </div>
  )
}
