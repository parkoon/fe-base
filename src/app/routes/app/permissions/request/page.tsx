import { Card } from '@/components/ui/card'

import { RequestPermissionStepActions } from './_components/request-permission-step-actions'
import { RequestPermissionStepDatasource } from './_components/request-permission-step-datasource'
import { RequestPermissionStepIndicator } from './_components/request-permission-step-indicator'
import { RequestPermissionStepSubmit } from './_components/request-permission-step-submit'
import { RequestPermissionStepTables } from './_components/request-permission-step-tables'
import { PermissionRequestProvider, usePermissionRequest } from './_context/request-context'

function StepContent() {
  const { state } = usePermissionRequest()
  if (state.step === 1) return <RequestPermissionStepDatasource />
  if (state.step === 2) return <RequestPermissionStepTables />
  return <RequestPermissionStepSubmit />
}

function PermissionRequestPage() {
  return (
    <PermissionRequestProvider>
      <div className="mx-auto w-full space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">권한 신청</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            DataSource와 Schema를 선택하고, 접근할 테이블의 권한을 신청합니다.
          </p>
        </div>
        <RequestPermissionStepIndicator />
        <Card>
          <StepContent />
        </Card>
        <RequestPermissionStepActions />
      </div>
    </PermissionRequestProvider>
  )
}

export default PermissionRequestPage
