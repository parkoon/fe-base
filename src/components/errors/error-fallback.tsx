import type { FallbackProps } from 'react-error-boundary'

import { Button } from '@/components/ui/button'

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div
      className="rounded-lg border border-red-200 bg-red-50 p-6 text-center"
      role="alert"
    >
      <p className="text-sm text-red-600">
        {(error as Error).message ?? '데이터를 불러오는데 실패했습니다.'}
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={resetErrorBoundary}
      >
        다시 시도
      </Button>
    </div>
  )
}
