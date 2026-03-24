import { CheckCircle2Icon, CircleDotIcon, CircleIcon, XCircleIcon } from 'lucide-react'

import { $dayjs } from '@/lib/dayjs'
import { cn } from '@/lib/utils'
import type { ApprovalStep } from '@/types/manual/permissions'

type ApprovalTimelineProps = {
  steps: ApprovalStep[]
}

const stepIcons = {
  PENDING: CircleIcon,
  APPROVED: CheckCircle2Icon,
  REJECTED: XCircleIcon,
} as const

const stepColors = {
  PENDING: 'text-muted-foreground',
  APPROVED: 'text-green-600',
  REJECTED: 'text-red-600',
} as const

export function ApprovalTimeline({ steps }: ApprovalTimelineProps) {
  const currentStepIndex = steps.findIndex((s) => s.status === 'PENDING')

  return (
    <div className="space-y-0">
      {steps.map((step, index) => {
        const Icon =
          step.status === 'PENDING' && index === currentStepIndex
            ? CircleDotIcon
            : stepIcons[step.status]
        const color =
          step.status === 'PENDING' && index === currentStepIndex
            ? 'text-yellow-500'
            : stepColors[step.status]

        return (
          <div
            key={step.step}
            className="relative flex gap-4 pb-6 last:pb-0"
          >
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'absolute top-[28px] left-[11px] h-[calc(100%-16px)] w-px',
                  step.status === 'APPROVED' ? 'bg-green-200' : 'bg-border'
                )}
              />
            )}

            {/* Icon */}
            <div className="relative z-10 flex-shrink-0 pt-0.5">
              <Icon className={cn('size-6', color)} />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{step.stepLabel}</p>
                  <p className="text-muted-foreground text-xs">
                    {step.approverName} · {step.approverDepartment}
                  </p>
                </div>
                {step.processedAt && (
                  <span className="text-muted-foreground text-xs whitespace-nowrap">
                    {$dayjs(step.processedAt).format('YYYY.MM.DD HH:mm')}
                  </span>
                )}
              </div>
              {step.comment && (
                <p className="text-muted-foreground bg-muted/50 mt-1 rounded-md px-3 py-2 text-sm">
                  {step.comment}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
