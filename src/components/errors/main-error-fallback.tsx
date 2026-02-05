import type { FallbackProps } from 'react-error-boundary'

import { Button } from '@/components/ui/button'

export function MainErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div
      className="flex h-screen flex-col items-center justify-center gap-4"
      role="alert"
    >
      <h1 className="text-2xl font-bold text-red-600">문제가 발생했습니다</h1>
      <p className="text-gray-600">
        {(error as Error).message ?? '알 수 없는 오류가 발생했습니다.'}
      </p>
      <Button onClick={resetErrorBoundary}>다시 시도</Button>
    </div>
  )
}
