import { AsyncBoundary } from '@/components/errors'
import { Button } from '@/components/ui/button'

import { MaskingColumnPicker } from './_components/masking-column-picker'
import { useMaskingRequest } from './_context/masking-request-context'

export function Step2() {
  const { actions, canProceedToStep3 } = useMaskingRequest()

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium">마스킹 컬럼 선택</p>
        <p className="text-muted-foreground text-xs">
          접근 권한을 신청할 마스킹 컬럼을 선택하세요. 여러 컬럼을 동시에 신청할 수 있습니다.
        </p>
        <AsyncBoundary>
          <MaskingColumnPicker />
        </AsyncBoundary>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          size="lg"
          onClick={() => actions.goToStep(1)}
        >
          이전
        </Button>
        <Button
          size="lg"
          onClick={() => actions.goToStep(3)}
          disabled={!canProceedToStep3}
        >
          다음
        </Button>
      </div>
    </div>
  )
}
