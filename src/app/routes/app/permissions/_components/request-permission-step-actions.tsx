import { ArrowLeftIcon, ArrowRightIcon, Loader2Icon, SendIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { usePermissionRequest } from '../_context/request-context'

export function RequestPermissionStepActions() {
  const { state, actions, canProceed, isSubmitting } = usePermissionRequest()

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="outline"
        size="lg"
        onClick={() => actions.setStep(state.step - 1)}
        disabled={state.step === 1}
      >
        <ArrowLeftIcon className="size-4" />
        이전
      </Button>

      {state.step < 3 ? (
        <Button
          size="lg"
          onClick={() => actions.setStep(state.step + 1)}
          disabled={!canProceed}
        >
          다음
          <ArrowRightIcon className="size-4" />
        </Button>
      ) : (
        <Button
          size="lg"
          onClick={actions.submit}
          disabled={!canProceed || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <SendIcon className="size-4" />
          )}
          권한 신청하기
        </Button>
      )}
    </div>
  )
}
