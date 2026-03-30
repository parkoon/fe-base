import { Separator } from '@/components/ui/separator'

import { MaskingStepIndicator } from './_components/step-indicator'
import { MaskingRequestProvider, useMaskingRequest } from './_context/masking-request-context'
import { Step1 } from './step1'
import { Step2 } from './step2'
import { Step3 } from './step3'

function PageContent() {
  const { currentStep } = useMaskingRequest()

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">마스킹 권한 신청</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          마스킹 처리된 컬럼의 접근 권한을 신청합니다.
        </p>
      </div>

      <MaskingStepIndicator />
      <Separator />

      {currentStep === 1 && <Step1 />}
      {currentStep === 2 && <Step2 />}
      {currentStep === 3 && <Step3 />}
    </div>
  )
}

export default function MaskingRequestPage() {
  return (
    <MaskingRequestProvider>
      <PageContent />
    </MaskingRequestProvider>
  )
}
