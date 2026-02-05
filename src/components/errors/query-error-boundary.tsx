import { QueryErrorResetBoundary } from '@tanstack/react-query'
import type { ComponentType, ReactNode } from 'react'
import { Suspense } from 'react'
import type { FallbackProps } from 'react-error-boundary'
import { ErrorBoundary } from 'react-error-boundary'

import { Spinner } from '@/components/ui/spinner'

import { ErrorFallback } from './error-fallback'

type QueryErrorBoundaryProps = {
  children: ReactNode
  /** 커스텀 에러 UI 컴포넌트 (기본값: ErrorFallback) */
  FallbackComponent?: ComponentType<FallbackProps>
}

export function QueryErrorBoundary({
  children,
  FallbackComponent = ErrorFallback,
}: QueryErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          FallbackComponent={FallbackComponent}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

// ============================================
// AsyncBoundary = Suspense + ErrorBoundary
// ============================================

type AsyncBoundaryProps = {
  children: ReactNode
  /** 로딩 UI (기본값: Spinner) */
  loadingFallback?: ReactNode
  /** 커스텀 에러 UI 컴포넌트 (기본값: ErrorFallback) */
  FallbackComponent?: ComponentType<FallbackProps>
}

/**
 * useSuspenseQuery와 함께 사용하는 통합 Boundary
 *
 * @example
 * <AsyncBoundary>
 *   <UserList />
 * </AsyncBoundary>
 *
 * @example 커스텀 로딩/에러 UI
 * <AsyncBoundary
 *   loadingFallback={<Skeleton />}
 *   FallbackComponent={CustomErrorFallback}
 * >
 *   <UserList />
 * </AsyncBoundary>
 */
export function AsyncBoundary({
  children,
  loadingFallback = <Spinner className="mx-auto" />,
  FallbackComponent = ErrorFallback,
}: AsyncBoundaryProps) {
  return (
    <QueryErrorBoundary FallbackComponent={FallbackComponent}>
      <Suspense fallback={loadingFallback}>{children}</Suspense>
    </QueryErrorBoundary>
  )
}
