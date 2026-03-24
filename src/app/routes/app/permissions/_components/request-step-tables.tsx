import { DatabaseIcon, Loader2Icon } from 'lucide-react'

import { AsyncBoundary } from '@/components/errors/query-error-boundary'
import { Badge } from '@/components/ui/badge'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { usePermissionRequest } from '../_context/request-context'
import { RequestTablePicker } from './request-table-picker'

export function RequestStepTables() {
  const { state, actions } = usePermissionRequest()

  return (
    <>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>테이블 선택</CardTitle>
          <Badge
            variant="secondary"
            className="text-xs"
          >
            <DatabaseIcon className="size-3" />
            {state.datasourceName}
            <span className="text-muted-foreground mx-0.5">/</span>
            {state.schema}
          </Badge>
        </div>
        <CardDescription>권한을 신청할 테이블을 선택하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <AsyncBoundary
          loadingFallback={
            <div className="flex items-center justify-center rounded-lg border py-6">
              <Loader2Icon className="text-muted-foreground size-5 animate-spin" />
            </div>
          }
        >
          <RequestTablePicker
            datasourceId={state.datasourceId!}
            schema={state.schema!}
            selectedTables={state.selectedTables}
            onToggleTable={actions.toggleTable}
          />
        </AsyncBoundary>
      </CardContent>
    </>
  )
}
