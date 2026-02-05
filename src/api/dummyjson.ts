import type { AxiosError } from 'axios'

import { paths as routePaths } from '@/config/paths'
import { createApiClient } from '@/lib/create-api-client'
import type { paths } from '@/types/dummyjson'

export const dummyjson = createApiClient<paths>('https://dummyjson.com')

// Request interceptor
dummyjson.instance.interceptors.request.use((config) => {
  config.headers.Accept = 'application/json'
  return config
})

// Response interceptor
dummyjson.instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const message = error.response?.data?.message ?? error.message

    console.error('API Error:', message)

    // 401 Unauthorized → 로그인 페이지로 리다이렉트
    if (error.response?.status === 401) {
      const redirectTo = window.location.pathname
      window.location.href = routePaths.auth.login.getHref(redirectTo)
    }

    return Promise.reject(new Error(message))
  }
)
