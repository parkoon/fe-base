import { LayersIcon, TableIcon, XIcon } from 'lucide-react'

import { DateRangePicker } from '@/components/date-range-picker'
import { AsyncBoundary } from '@/components/errors'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

import { StepIndicator } from './_components/step-indicator'
import { TableRequestSchemaPicker } from './_components/table-request-schema-picker'
import { TableRequestTablePicker } from './_components/table-request-table-picker'
import {
  TablePermissionRequestProvider,
  useTablePermissionRequest,
} from './_context/table-request-context'

function Step1() {
  const { state, actions, canProceedToNext } = useTablePermissionRequest()

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">Schema</p>
        <AsyncBoundary>
          <TableRequestSchemaPicker />
        </AsyncBoundary>
      </div>

      <Separator />

      <div className="space-y-2">
        <p className="text-sm font-medium">테이블 선택</p>
        {state.selectedSchema ? (
          <AsyncBoundary>
            <TableRequestTablePicker />
          </AsyncBoundary>
        ) : (
          <TableRequestTablePicker />
        )}
      </div>

      {state.selectedTables.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {state.selectedTables.map((table) => (
            <Badge
              key={table.tableName}
              variant="secondary"
              className="gap-1 font-mono text-xs"
            >
              {table.tableName}
              <button
                type="button"
                onClick={() => actions.removeTable(table.tableName)}
                className="hover:text-destructive ml-0.5"
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button
          size="lg"
          onClick={actions.nextStep}
          disabled={!canProceedToNext}
        >
          다음
        </Button>
      </div>
    </div>
  )
}

function Step2() {
  const { state, actions, canSubmit, isSubmitting } = useTablePermissionRequest()

  return (
    <div className="mx-auto space-y-6">
      <div className="bg-muted/40 space-y-3 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <LayersIcon className="text-muted-foreground size-4 shrink-0" />
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs">Schema</p>
            <p className="truncate font-mono text-sm font-medium">
              {state.selectedSchema!.datasourceName} / {state.selectedSchema!.schemaName}
            </p>
          </div>
        </div>
        <Separator />
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <TableIcon className="text-muted-foreground size-4 shrink-0" />
            <p className="text-muted-foreground text-xs">
              테이블 {state.selectedTables.length}개 선택됨
            </p>
          </div>
          <div className="flex flex-wrap gap-1">
            {state.selectedTables.map((table) => (
              <Badge
                key={table.tableName}
                variant="secondary"
                className="font-mono text-xs"
              >
                {table.tableName}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          신청 사유 <span className="text-destructive">*</span>
        </label>
        <Textarea
          placeholder="권한이 필요한 업무 목적과 사유를 입력하세요."
          value={state.reason}
          onChange={(e) => actions.setReason(e.target.value)}
          className="min-h-[100px] resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          사용 기간 <span className="text-destructive">*</span>
        </label>
        <DateRangePicker
          startDate={state.startDate}
          endDate={state.endDate}
          onStartChange={actions.setStartDate}
          onEndChange={actions.setEndDate}
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          size="lg"
          onClick={actions.prevStep}
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

function PageContent() {
  const { state } = useTablePermissionRequest()

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">테이블 권한 신청</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          스키마를 선택하고 접근할 테이블의 권한을 신청합니다.
        </p>
      </div>

      <StepIndicator />
      <Separator />

      {state.currentStep === 1 ? <Step1 /> : <Step2 />}
    </div>
  )
}

function TablePermissionRequestPage() {
  return (
    <TablePermissionRequestProvider>
      <PageContent />
    </TablePermissionRequestProvider>
  )
}

export default TablePermissionRequestPage
