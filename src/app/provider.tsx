import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Suspense, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Toaster } from 'sonner'

import { MainErrorFallback } from '@/components/errors'
import { Spinner } from '@/components/ui'
import { createQueryClient } from '@/lib/react-query'

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

export function AppProvider({ children }: AppProviderProps) {
  // React 19 안정성을 위해 useState로 QueryClient 관리
  const [queryClient] = useState(() => createQueryClient())

  return (
    <ErrorBoundary FallbackComponent={MainErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
        <Toaster
          position="top-right"
          closeButton
        />
        {import.meta.env.DEV && <ReactQueryDevtools />}
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
