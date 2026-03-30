import { cn } from '@/lib/utils'

import { useTablePermissionRequest } from '../_context/table-request-context'

const STEPS = [
  { step: 1, label: '테이블 선택' },
  { step: 2, label: '신청 정보' },
] as const

export function StepIndicator() {
  const { state } = useTablePermissionRequest()

  return (
    <div className="flex items-center gap-2">
      {STEPS.map(({ step, label }, index) => (
        <div
          key={step}
          className="flex items-center gap-2"
        >
          <div
            className={cn(
              'flex size-6 items-center justify-center rounded-full text-xs font-medium',
              state.currentStep === step
                ? 'bg-primary text-primary-foreground'
                : state.currentStep > step
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
            )}
          >
            {step}
          </div>
          <span
            className={cn(
              'text-sm',
              state.currentStep === step ? 'font-medium' : 'text-muted-foreground'
            )}
          >
            {label}
          </span>
          {index < STEPS.length - 1 && <div className="bg-border mx-1 h-px w-8" />}
        </div>
      ))}
    </div>
  )
}
