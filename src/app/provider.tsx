import { QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'sonner'

import { MainErrorFallback } from '@/components/errors'
import { Spinner } from '@/components/ui'
import { TooltipProvider } from '@/components/ui/tooltip'
import { env } from '@/config/env'
import { useIdleTimeout } from '@/hooks/use-idle-timeout'
import { AuthLoader, useAuthStore } from '@/lib/auth'
import { createQueryClient } from '@/lib/react-query'

const ReactQueryDevtools = lazy(() =>
  import('@tanstack/react-query-devtools').then((m) => ({ default: m.ReactQueryDevtools }))
)

type AppProviderProps = {
  children: React.ReactNode
}

function LoadingFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

const DEFAULT_IDLE_TIMEOUT_MS = 30 * 60 * 1000 // 30분

function IdleTimeoutHandler() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  useIdleTimeout({
    timeoutMs: env.IDLE_TIMEOUT_MS ?? DEFAULT_IDLE_TIMEOUT_MS,
    onIdle: logout,
    enabled: !!user?.accessToken,
  })

  return null
}

export function AppProvider({ children }: AppProviderProps) {
  // React 19 안정성을 위해 useState로 QueryClient 관리
  const [queryClient] = useState(() => createQueryClient())

  return (
    <ErrorBoundary FallbackComponent={MainErrorFallback}>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<LoadingFallback />}>
            <AuthLoader renderLoading={() => <LoadingFallback />}>
              <IdleTimeoutHandler />
              <TooltipProvider>{children}</TooltipProvider>
            </AuthLoader>
          </Suspense>
          <Toaster
            position="top-right"
            closeButton
          />
          {import.meta.env.DEV && <ReactQueryDevtools />}
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  )
}
