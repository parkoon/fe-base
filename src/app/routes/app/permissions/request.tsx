import { Card } from '@/components/ui/card'

import { RequestStepActions } from './_components/request-step-actions'
import { RequestStepDatasource } from './_components/request-step-datasource'
import { RequestStepIndicator } from './_components/request-step-indicator'
import { RequestStepSubmit } from './_components/request-step-submit'
import { RequestStepTables } from './_components/request-step-tables'
import { PermissionRequestProvider, usePermissionRequest } from './_context/request-context'

function StepContent() {
  const { state } = usePermissionRequest()
  if (state.step === 1) return <RequestStepDatasource />
  if (state.step === 2) return <RequestStepTables />
  return <RequestStepSubmit />
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
        <RequestStepIndicator />
        <Card>
          <StepContent />
        </Card>
        <RequestStepActions />
      </div>
    </PermissionRequestProvider>
  )
}

export default PermissionRequestPage
