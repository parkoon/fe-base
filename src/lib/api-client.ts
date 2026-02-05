import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import Axios from 'axios'

import { env } from '@/config/env'
import { paths } from '@/config/paths'

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = 'application/json'
  }
  config.withCredentials = true
  return config
}

export const api = Axios.create({
  baseURL: env.API_URL,
})

api.interceptors.request.use(authRequestInterceptor)

api.interceptors.response.use(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  (response) => response.data,
  (error: AxiosError<{ message?: string }>) => {
    const message = error.response?.data?.message ?? error.message

    // TODO: 알림 시스템 연동
    console.error('API Error:', message)

    // 401 Unauthorized - 로그인 페이지로 리다이렉트
    if (error.response?.status === 401) {
      const redirectTo = window.location.pathname
      window.location.href = paths.auth.login.getHref(redirectTo)
    }

    return Promise.reject(new Error(message))
  }
)
