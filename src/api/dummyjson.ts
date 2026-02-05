import { createApiClient } from '@/lib/api'
import { setupAuthInterceptor } from '@/lib/auth'
import type { paths } from '@/types/dummyjson'

export const dummyjson = createApiClient<paths>('https://dummyjson.com')

// Auth interceptor 설정
setupAuthInterceptor(dummyjson.instance, {
  refreshTokenFn: async (refreshToken) => {
    const response = await dummyjson.POST('/auth/refresh', {
      refreshToken,
      expiresInMins: 60,
    })
    return {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    }
  },
})
