import { CheckIcon, DatabaseIcon, SendIcon, TableIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

import { usePermissionRequest } from '../_context/request-context'

const STEPS = [
  { id: 1, label: 'DataSource / Schema', icon: DatabaseIcon },
  { id: 2, label: '테이블 선택', icon: TableIcon },
  { id: 3, label: '신청 정보', icon: SendIcon },
] as const

export function RequestPermissionStepIndicator() {
  const { state } = usePermissionRequest()

  return (
    <div className="flex items-center gap-0">
      {STEPS.map((s, i) => {
        const isActive = state.step === s.id
        const isCompleted = state.step > s.id
        const StepIcon = s.icon

        return (
          <div
            key={s.id}
            className="flex items-center"
          >
            <div
              className={cn(
                'flex flex-1 items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors',
                isActive && 'bg-primary-50 text-primary-700',
                isCompleted && 'text-primary-600',
                !isActive && !isCompleted && 'text-muted-foreground'
              )}
            >
              <div
                className={cn(
                  'flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  isActive && 'bg-primary-500 text-white',
                  isCompleted && 'bg-primary-100 text-primary-700',
                  !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? <CheckIcon className="size-3.5" /> : s.id}
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <StepIcon className="size-3.5" />
                {s.label}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-1 h-px w-6 shrink-0',
                  isCompleted ? 'bg-primary-300' : 'bg-border'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
