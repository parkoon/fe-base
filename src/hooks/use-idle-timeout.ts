import { useCallback, useEffect, useRef } from 'react'

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = ['mousedown', 'keydown', 'scroll', 'touchstart']

type UseIdleTimeoutOptions = {
  timeoutMs: number
  onIdle: () => void
  enabled?: boolean
}

/**
 * 사용자 비활성 시간 감지 후 콜백을 실행합니다.
 *
 * - mousedown, keydown, scroll, touchstart 이벤트로 활성 감지
 * - passive 리스너 사용 (성능 최적화)
 * - enabled=false로 비활성화 가능
 */
export function useIdleTimeout({ timeoutMs, onIdle, enabled = true }: UseIdleTimeoutOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const onIdleRef = useRef(onIdle)

  useEffect(() => {
    onIdleRef.current = onIdle
  }, [onIdle])

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    timerRef.current = setTimeout(() => {
      onIdleRef.current()
    }, timeoutMs)
  }, [timeoutMs])

  useEffect(() => {
    if (!enabled) return

    resetTimer()

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, resetTimer, { passive: true })
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetTimer)
      }
    }
  }, [resetTimer, enabled])
}
