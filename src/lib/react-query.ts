import type { DefaultOptions, UseMutationOptions } from '@tanstack/react-query'
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ApiError } from './api/error'

// ============================================
// Retry Strategy
// ============================================

/**
 * 재시도 가능한 에러인지 판단
 * - 서버 에러(5xx)와 네트워크 에러만 재시도
 * - 클라이언트 에러(4xx)는 재시도해도 동일한 결과
 */
const shouldRetry = (failureCount: number, error: unknown): boolean => {
  // 최대 3회 재시도
  if (failureCount >= 3) return false

  // 서버 에러(5xx)만 재시도
  if (error instanceof ApiError) {
    return error.isServerError
  }

  // 네트워크 에러도 재시도
  if (error instanceof Error && error.message === 'Network Error') {
    return true
  }

  // 4xx 에러는 재시도 안함 (클라이언트 에러)
  return false
}

/**
 * 지수 백오프 (Exponential Backoff)
 * 1회: 1초, 2회: 2초, 3회: 4초... (최대 30초)
 */
const getRetryDelay = (attemptIndex: number): number => {
  return Math.min(1000 * 2 ** attemptIndex, 30000)
}

// ============================================
// Query Cache (전역 에러 핸들링)
// ============================================

const queryCache = new QueryCache({
  onError: (error, query) => {
    // Background refetch 실패 시에만 토스트 표시
    // 초기 로딩 실패는 ErrorBoundary가 처리
    if (query.state.data !== undefined) {
      const message =
        error instanceof ApiError ? error.message : '데이터를 새로고침하는데 실패했습니다.'
      toast.error(message)
    }
  },
})

// ============================================
// Mutation Cache (전역 Mutation 에러 핸들링)
// ============================================

const mutationCache = new MutationCache({
  onError: (error) => {
    const message = error instanceof ApiError ? error.message : '요청 처리 중 오류가 발생했습니다.'
    toast.error(message)
  },
})

// ============================================
// Query Config
// ============================================

export const queryConfig = {
  queries: {
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60, // 1분
    retry: shouldRetry,
    retryDelay: getRetryDelay,
    // ErrorBoundary로 에러 전파 (useSuspenseQuery와 함께 사용)
    throwOnError: true,
  },
} satisfies DefaultOptions

// ============================================
// QueryClient Factory
// ============================================

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: queryConfig,
    queryCache,
    mutationCache,
  })
}

// ============================================
// Type Helpers
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiFnReturnType<FnType extends (...args: any) => Promise<any>> = Awaited<
  ReturnType<FnType>
>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueryConfig<T extends (...args: any[]) => any> = Omit<
  ReturnType<T>,
  'queryKey' | 'queryFn'
>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MutationConfig<MutationFnType extends (...args: any) => Promise<any>> =
  UseMutationOptions<ApiFnReturnType<MutationFnType>, Error, Parameters<MutationFnType>[0]>
