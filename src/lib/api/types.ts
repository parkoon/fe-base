// HTTP Method 타입
type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'

// Operation 추출: paths['/auth/login']['post']
type Operation<Paths, Path extends keyof Paths, Method extends HttpMethod> =
  Paths[Path] extends Record<Method, infer Op> ? Op : never

// Request Body 추론
export type InferBody<Paths, Path extends keyof Paths, Method extends HttpMethod> =
  Operation<Paths, Path, Method> extends {
    requestBody: { content: { 'application/json': infer B } }
  }
    ? B
    : never

// Response 추론 (200 | 201)
export type InferResponse<Paths, Path extends keyof Paths, Method extends HttpMethod> =
  Operation<Paths, Path, Method> extends {
    responses: { 200: { content: { 'application/json': infer R } } }
  }
    ? R
    : Operation<Paths, Path, Method> extends {
          responses: { 201: { content: { 'application/json': infer R } } }
        }
      ? R
      : never

// Path Params 추론
export type InferPathParams<Paths, Path extends keyof Paths, Method extends HttpMethod> =
  Operation<Paths, Path, Method> extends {
    parameters: { path: infer P }
  }
    ? P
    : never

// Query Params 추론
export type InferQueryParams<Paths, Path extends keyof Paths, Method extends HttpMethod> =
  Operation<Paths, Path, Method> extends {
    parameters: { query?: infer Q }
  }
    ? Q
    : never
