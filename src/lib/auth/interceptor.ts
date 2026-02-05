import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'

import { paths as routePaths } from '@/config/paths'
import { ApiError, type ApiErrorResponse } from '@/lib/api-error'

import { getAccessToken, getRefreshToken, useAuthStore } from './store'

interface RefreshTokenConfig {
  /** Refresh token API 호출 함수 */
  refreshTokenFn: (refreshToken: string) => Promise<{
    accessToken?: string
    refreshToken?: string
  }>
  /** 인증 페이지 prefix (해당 페이지에서는 401 리다이렉트 제외) */
  authPathPrefix?: string
}

/**
 * Axios 인스턴스에 인증 인터셉터를 설정합니다.
 * - Request: Authorization 헤더 자동 추가
 * - Response: 401 시 토큰 갱신 및 재요청
 */
export function setupAuthInterceptor(instance: AxiosInstance, config: RefreshTokenConfig) {
  const { refreshTokenFn, authPathPrefix = '/auth' } = config

  // Refresh token state (인스턴스별로 분리)
  let isRefreshing = false
  let failedQueue: {
    resolve: (token: string) => void
    reject: (error: Error) => void
  }[] = []

  const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error)
      } else if (token) {
        promise.resolve(token)
      }
    })
    failedQueue = []
  }

  // Request interceptor
  instance.interceptors.request.use((requestConfig) => {
    requestConfig.headers.Accept = 'application/json'

    const token = getAccessToken()
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`
    }

    return requestConfig
  })

  // Response interceptor
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorResponse>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean
      }
      const statusCode = error.response?.status ?? 500
      const data = error.response?.data
      const message = data?.message ?? error.message ?? 'Unknown error'

      // 401 Unauthorized - try refresh token
      if (
        statusCode === 401 &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/login') &&
        !originalRequest.url?.includes('/auth/refresh')
      ) {
        const refreshToken = getRefreshToken()

        // No refresh token - logout and redirect
        if (!refreshToken) {
          useAuthStore.getState().logout()
          if (!window.location.pathname.startsWith(authPathPrefix)) {
            const redirectTo = window.location.pathname
            window.location.href = routePaths.auth.login.getHref(redirectTo)
          }
          return Promise.reject(new ApiError(message, statusCode))
        }

        // Already refreshing - queue this request
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return instance(originalRequest)
            })
            .catch((err: Error) => Promise.reject(err))
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const response = await refreshTokenFn(refreshToken)
          const newAccessToken = response.accessToken

          if (newAccessToken) {
            const currentUser = useAuthStore.getState().user
            if (currentUser) {
              useAuthStore.getState().setUser({
                ...currentUser,
                accessToken: newAccessToken,
                refreshToken: response.refreshToken ?? refreshToken,
              })
            }

            processQueue(null, newAccessToken)

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return instance(originalRequest)
          }

          throw new Error('No access token in refresh response')
        } catch (refreshError) {
          processQueue(refreshError as Error, null)
          useAuthStore.getState().logout()

          if (!window.location.pathname.startsWith(authPathPrefix)) {
            const redirectTo = window.location.pathname
            window.location.href = routePaths.auth.login.getHref(redirectTo)
          }

          return Promise.reject(new ApiError('Session expired', 401))
        } finally {
          isRefreshing = false
        }
      }

      return Promise.reject(new ApiError(message, statusCode))
    }
  )
}
