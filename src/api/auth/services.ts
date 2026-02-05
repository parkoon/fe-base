import type { InferBody } from '@/lib/api'
import type { paths } from '@/types/dummyjson'

import { dummyjson } from '../dummyjson'

// Services - path + method로 타입 자동 추론
export const postAuthLoginService = (data: InferBody<paths, '/auth/login', 'post'>) =>
  dummyjson.POST('/auth/login', data)

export const getAuthMeService = () => dummyjson.GET('/auth/me')

export const postAuthRefreshService = (data: InferBody<paths, '/auth/refresh', 'post'>) =>
  dummyjson.POST('/auth/refresh', data)
