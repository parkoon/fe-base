import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Suspense, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { queryConfig } from '@/lib/react-query'

type AppProviderProps = {
  children: React.ReactNode
}

function ErrorFallback() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Reload
        </button>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>
  )
}

export function AppProvider({ children }: AppProviderProps) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: queryConfig }))

  return (
    <Suspense fallback={<LoadingFallback />}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <QueryClientProvider client={queryClient}>
          {import.meta.env.DEV && <ReactQueryDevtools />}
          {children}
        </QueryClientProvider>
      </ErrorBoundary>
    </Suspense>
  )
}
