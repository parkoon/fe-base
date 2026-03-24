import { DatabaseIcon } from 'lucide-react'

import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { usePermissionRequest } from '../_context/request-context'
import { RequestPermissionDatasourcePicker } from './request-permission-datasource-picker'

export function RequestPermissionStepDatasource() {
  const { state, actions } = usePermissionRequest()

  return (
    <>
      <CardHeader>
        <CardTitle>DataSource / Schema 선택</CardTitle>
        <CardDescription>접근할 데이터베이스와 스키마를 선택하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <RequestPermissionDatasourcePicker
          datasourceId={state.datasourceId}
          schema={state.schema}
          onDatasourceChange={actions.changeDatasource}
          onSchemaChange={actions.changeSchema}
        />
        {state.datasourceId && state.schema && (
          <div className="bg-muted/50 mt-4 flex items-center gap-2 rounded-lg px-3 py-2">
            <DatabaseIcon className="text-primary-500 size-4" />
            <span className="text-sm">
              <span className="font-medium">{state.datasourceName}</span>
              <span className="text-muted-foreground mx-1.5">/</span>
              <span className="font-medium">{state.schema}</span>
            </span>
          </div>
        )}
      </CardContent>
    </>
  )
}
