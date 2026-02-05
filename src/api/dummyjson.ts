import type { AxiosError } from 'axios'

import { paths as routePaths } from '@/config/paths'
import { ApiError, type ApiErrorResponse } from '@/lib/api-error'
import { getAccessToken } from '@/lib/auth'
import { createApiClient } from '@/lib/create-api-client'
import type { paths } from '@/types/dummyjson'

export const dummyjson = createApiClient<paths>('https://dummyjson.com')

// Request interceptor
dummyjson.instance.interceptors.request.use((config) => {
  config.headers.Accept = 'application/json'

  // Authorization header 추가
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Response interceptor
dummyjson.instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const statusCode = error.response?.status ?? 500
    const data = error.response?.data
    const message = data?.message ?? error.message ?? 'Unknown error'

    console.error(`API Error [${statusCode}]:`, message)

    // 401 Unauthorized → 로그인 페이지로 리다이렉트 (로그인 페이지에서는 제외)
    if (statusCode === 401 && !window.location.pathname.startsWith('/auth')) {
      const redirectTo = window.location.pathname
      window.location.href = routePaths.auth.login.getHref(redirectTo)
    }

    return Promise.reject(new ApiError(message, statusCode))
  }
)
