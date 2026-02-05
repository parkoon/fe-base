import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { getAuthMeQueryOptions } from '@/api/auth'

import { useAuthStore } from './store'

type AuthLoaderProps = {
  children: React.ReactNode
  renderLoading: () => React.ReactNode
}

/**
 * 앱 시작 시 인증 상태를 서버에서 검증합니다.
 *
 * 동작 방식:
 * 1. localStorage에 토큰이 있으면 GET /auth/me 호출
 * 2. 성공 → user 정보 업데이트 (최신 정보 반영)
 * 3. 실패(401) → 인터셉터가 refresh 시도 후 실패 시 logout 처리
 * 4. 토큰 없음 → 바로 children 렌더링
 *
 * Note: logout은 인터셉터(interceptor.ts)에서 처리하므로 여기서는 하지 않음
 */
export function AuthLoader({ children, renderLoading }: AuthLoaderProps) {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const hasSynced = useRef(false)

  // 토큰이 있을 때만 /auth/me 호출
  const { data, isLoading } = useQuery({
    ...getAuthMeQueryOptions(),
    enabled: !!user?.accessToken,
    retry: false, // 인터셉터가 refresh 처리하므로 retry 불필요
  })

  // /auth/me 성공 시 user 정보 업데이트 (한 번만)
  useEffect(() => {
    if (data && user && !hasSynced.current) {
      hasSynced.current = true
      setUser({
        ...user,
        ...data,
      })
    }
  }, [data, user, setUser])

  // 토큰이 있고 검증 중일 때 로딩 표시
  if (user?.accessToken && isLoading) {
    return <>{renderLoading()}</>
  }

  return <>{children}</>
}
