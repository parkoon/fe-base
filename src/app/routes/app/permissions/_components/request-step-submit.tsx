import { DatabaseIcon, LayersIcon, TableIcon } from 'lucide-react'

import { DateRangePicker } from '@/components/date-range-picker'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'

import { usePermissionRequest } from '../_context/request-context'

export function RequestStepSubmit() {
  const { state, actions } = usePermissionRequest()

  return (
    <>
      <CardHeader>
        <CardTitle>신청 정보 입력</CardTitle>
        <CardDescription>선택한 항목을 확인하고, 신청 사유와 기간을 입력하세요.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 선택 요약 */}
        <div className="bg-muted/40 rounded-lg p-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <DatabaseIcon className="text-muted-foreground size-4" />
              <div>
                <p className="text-muted-foreground text-xs">DataSource</p>
                <p className="text-sm font-medium">{state.datasourceName}</p>
              </div>
            </div>
            <Separator
              orientation="vertical"
              className="data-[orientation=vertical]:h-8"
            />
            <div className="flex items-center gap-2">
              <LayersIcon className="text-muted-foreground size-4" />
              <div>
                <p className="text-muted-foreground text-xs">Schema</p>
                <p className="text-sm font-medium">{state.schema}</p>
              </div>
            </div>
            <Separator
              orientation="vertical"
              className="data-[orientation=vertical]:h-8"
            />
            <div className="flex items-center gap-2">
              <TableIcon className="text-muted-foreground size-4" />
              <div>
                <p className="text-muted-foreground text-xs">테이블</p>
                <p className="text-sm font-medium">{state.selectedTables.length}개</p>
              </div>
            </div>
          </div>
          <Separator className="my-3" />
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {state.selectedTables.map((table) => (
              <span
                key={table.tableName}
                className="text-muted-foreground flex items-center gap-1 text-xs"
              >
                <TableIcon className="size-3" />
                <span className="font-mono">{table.tableName}</span>
                {table.tableComment && (
                  <span className="text-muted-foreground/60">{table.tableComment}</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* 사유 */}
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

        {/* 기간 */}
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
      </CardContent>
    </>
  )
}
