import { LayersIcon, Loader2Icon, SendIcon, TableIcon, XIcon } from 'lucide-react'

import { DateRangePicker } from '@/components/date-range-picker'
import { AsyncBoundary } from '@/components/errors'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

import { TableRequestSchemaPicker } from './_components/table-request-schema-picker'
import { TableRequestTablePicker } from './_components/table-request-table-picker'
import {
  TablePermissionRequestProvider,
  useTablePermissionRequest,
} from './_context/table-request-context'

function LeftColumn() {
  const { state } = useTablePermissionRequest()

  return (
    <div className="flex-1 space-y-4 pr-8">
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
    </div>
  )
}

function RightColumn() {
  const { state, actions } = useTablePermissionRequest()

  return (
    <div className="w-[340px] space-y-5 pl-8">
      {/* 선택 요약 */}
      {state.selectedSchema && (
        <div className="bg-muted/40 space-y-3 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <LayersIcon className="text-muted-foreground size-4 shrink-0" />
            <div className="min-w-0">
              <p className="text-muted-foreground text-xs">Schema</p>
              <p className="truncate font-mono text-sm font-medium">
                {state.selectedSchema.datasourceName} / {state.selectedSchema.schemaName}
              </p>
            </div>
          </div>
          {state.selectedTables.length > 0 && (
            <>
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
              </div>
            </>
          )}
        </div>
      )}

      {/* 신청 사유 */}
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

      {/* 사용 기간 */}
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
    </div>
  )
}

function PageHeader() {
  const { actions, canSubmit, isSubmitting } = useTablePermissionRequest()

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">테이블 권한 신청</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          스키마를 선택하고 접근할 테이블의 권한을 신청합니다.
        </p>
      </div>
      <Button
        size="lg"
        onClick={actions.submit}
        disabled={!canSubmit || isSubmitting}
      >
        {isSubmitting ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <SendIcon className="size-4" />
        )}
        신청하기
      </Button>
    </div>
  )
}

function TablePermissionRequestPage() {
  return (
    <TablePermissionRequestProvider>
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <PageHeader />

        <div className="flex items-start">
          <LeftColumn />
          <Separator
            orientation="vertical"
            className="self-stretch"
          />
          <RightColumn />
        </div>
      </div>
    </TablePermissionRequestProvider>
  )
}

export default TablePermissionRequestPage
