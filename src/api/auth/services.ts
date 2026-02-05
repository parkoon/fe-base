import type { components } from '@/types/dummyjson'

import { dummyjson } from '../dummyjson'

// Types
export type LoginRequest = components['schemas']['LoginRequest']
export type AuthResponse = components['schemas']['AuthResponse']
export type User = components['schemas']['User']

// Services - named after API path in camelCase
export const postAuthLoginService = (data: LoginRequest) => dummyjson.POST('/auth/login', data)

export const getAuthMeService = () => dummyjson.GET('/auth/me')

export const postAuthRefreshService = (data: { refreshToken: string; expiresInMins?: number }) =>
  dummyjson.POST('/auth/refresh', data)
