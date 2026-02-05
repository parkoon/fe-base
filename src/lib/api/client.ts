import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import axios from 'axios'

// OpenAPI 타입 추출 헬퍼
type PathParams<T> = T extends { parameters: { path: infer P } } ? P : never
type QueryParams<T> = T extends { parameters: { query?: infer Q } } ? Q : never
type RequestBody<T> = T extends {
  requestBody: { content: { 'application/json': infer B } }
}
  ? B
  : never
type ResponseData<T> = T extends {
  responses: { 200: { content: { 'application/json': infer R } } }
}
  ? R
  : T extends { responses: { 201: { content: { 'application/json': infer R } } } }
    ? R
    : never

// HTTP 메서드가 있는 path만 추출
type PathsWithMethod<Paths, Method extends string> = {
  [P in keyof Paths]: Paths[P] extends Record<Method, unknown> ? P : never
}[keyof Paths]

export function createApiClient<Paths>(baseURL: string, config?: AxiosRequestConfig) {
  const instance: AxiosInstance = axios.create({ baseURL, ...config })

  // path parameter 치환: /users/{id} → /users/123
  const replacePath = (path: string, params?: Record<string, unknown>): string => {
    if (!params) return path
    return Object.entries(params).reduce(
      (acc, [key, value]) => acc.replace(`{${key}}`, String(value)),
      path
    )
  }

  return {
    instance, // 인터셉터 설정용

    GET: <P extends PathsWithMethod<Paths, 'get'> & string>(
      path: P,
      options?: {
        path?: PathParams<Paths[P] extends { get: infer G } ? G : never>
        query?: QueryParams<Paths[P] extends { get: infer G } ? G : never>
        signal?: AbortSignal
      }
    ): Promise<ResponseData<Paths[P] extends { get: infer G } ? G : never>> => {
      const url = replacePath(path, options?.path as Record<string, unknown>)
      return instance
        .get(url, { params: options?.query, signal: options?.signal })
        .then((res) => res.data as ResponseData<Paths[P] extends { get: infer G } ? G : never>)
    },

    POST: <P extends PathsWithMethod<Paths, 'post'> & string>(
      path: P,
      body?: RequestBody<Paths[P] extends { post: infer G } ? G : never>,
      options?: {
        path?: PathParams<Paths[P] extends { post: infer G } ? G : never>
        query?: QueryParams<Paths[P] extends { post: infer G } ? G : never>
        signal?: AbortSignal
      }
    ): Promise<ResponseData<Paths[P] extends { post: infer G } ? G : never>> => {
      const url = replacePath(path, options?.path as Record<string, unknown>)
      return instance
        .post(url, body, { params: options?.query, signal: options?.signal })
        .then((res) => res.data as ResponseData<Paths[P] extends { post: infer G } ? G : never>)
    },

    PUT: <P extends PathsWithMethod<Paths, 'put'> & string>(
      path: P,
      body?: RequestBody<Paths[P] extends { put: infer G } ? G : never>,
      options?: {
        path?: PathParams<Paths[P] extends { put: infer G } ? G : never>
        query?: QueryParams<Paths[P] extends { put: infer G } ? G : never>
        signal?: AbortSignal
      }
    ): Promise<ResponseData<Paths[P] extends { put: infer G } ? G : never>> => {
      const url = replacePath(path, options?.path as Record<string, unknown>)
      return instance
        .put(url, body, { params: options?.query, signal: options?.signal })
        .then((res) => res.data as ResponseData<Paths[P] extends { put: infer G } ? G : never>)
    },

    PATCH: <P extends PathsWithMethod<Paths, 'patch'> & string>(
      path: P,
      body?: RequestBody<Paths[P] extends { patch: infer G } ? G : never>,
      options?: {
        path?: PathParams<Paths[P] extends { patch: infer G } ? G : never>
        query?: QueryParams<Paths[P] extends { patch: infer G } ? G : never>
        signal?: AbortSignal
      }
    ): Promise<ResponseData<Paths[P] extends { patch: infer G } ? G : never>> => {
      const url = replacePath(path, options?.path as Record<string, unknown>)
      return instance
        .patch(url, body, { params: options?.query, signal: options?.signal })
        .then((res) => res.data as ResponseData<Paths[P] extends { patch: infer G } ? G : never>)
    },

    DELETE: <P extends PathsWithMethod<Paths, 'delete'> & string>(
      path: P,
      options?: {
        path?: PathParams<Paths[P] extends { delete: infer G } ? G : never>
        query?: QueryParams<Paths[P] extends { delete: infer G } ? G : never>
        signal?: AbortSignal
      }
    ): Promise<ResponseData<Paths[P] extends { delete: infer G } ? G : never>> => {
      const url = replacePath(path, options?.path as Record<string, unknown>)
      return instance
        .delete(url, { params: options?.query, signal: options?.signal })
        .then((res) => res.data as ResponseData<Paths[P] extends { delete: infer G } ? G : never>)
    },
  }
}
