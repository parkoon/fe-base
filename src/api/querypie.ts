import { env } from '@/config/env'
import { createApiClient } from '@/lib/api'
import { setupAuthInterceptor } from '@/lib/auth'

// TODO: 백엔드 OpenAPI 스펙 확정 후 생성된 타입으로 교체
// import type { paths } from '@/types/querypie'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type QueryPiePaths = {}

export const querypie = createApiClient<QueryPiePaths>(env.QUERYPIE_API_URL ?? env.API_URL)

// Auth interceptor 설정
setupAuthInterceptor(querypie.instance, {
  refreshTokenFn: async (refreshToken) => {
    const response = await querypie.instance.post<{
      accessToken: string
      refreshToken: string
    }>('/auth/refresh', { refreshToken })
    return {
      accessToken: response.data.accessToken,
      refreshToken: response.data.refreshToken,
    }
  },
})
