import type { AxiosError } from 'axios'

// API Error Response 타입 (서버에서 반환하는 에러 형태)
export type ApiErrorResponse = {
  message?: string
  error?: string
  statusCode?: number
}

// 커스텀 API Error 클래스
export class ApiError extends Error {
  public readonly statusCode: number
  public readonly isApiError = true

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
  }

  // 401: 인증 필요
  get isUnauthorized(): boolean {
    return this.statusCode === 401
  }

  // 403: 권한 없음
  get isForbidden(): boolean {
    return this.statusCode === 403
  }

  // 404: 리소스 없음
  get isNotFound(): boolean {
    return this.statusCode === 404
  }

  // 422: 유효성 검사 실패
  get isValidationError(): boolean {
    return this.statusCode === 422
  }

  // 5xx: 서버 에러
  get isServerError(): boolean {
    return this.statusCode >= 500
  }
}

// Axios Error를 ApiError로 변환
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  if (isAxiosError(error)) {
    const statusCode = error.response?.status ?? 500
    const data = error.response?.data
    const message = data?.message ?? data?.error ?? error.message ?? 'Unknown error'

    return new ApiError(message, statusCode)
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 500)
  }

  return new ApiError('Unknown error', 500)
}

// Axios Error 타입 가드
function isAxiosError(error: unknown): error is AxiosError<ApiErrorResponse> {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  )
}

// 에러 메시지 추출 헬퍼
export function getErrorMessage(error: unknown): string {
  return toApiError(error).message
}

// HTTP 상태 코드별 기본 메시지
export const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: '잘못된 요청입니다.',
  401: '로그인이 필요합니다.',
  403: '접근 권한이 없습니다.',
  404: '요청한 리소스를 찾을 수 없습니다.',
  422: '입력값을 확인해주세요.',
  429: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  500: '서버 오류가 발생했습니다.',
  502: '서버에 연결할 수 없습니다.',
  503: '서비스를 일시적으로 사용할 수 없습니다.',
}
