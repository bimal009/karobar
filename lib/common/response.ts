import { Meta } from "./pagination"

export interface ApiResponse<T> {
  message: string
  error: string | Record<string, unknown> | null
  data?: T
  meta?: Meta
}

export class AppResponse {
  static ok<T>(data: T, message = "Success"): ApiResponse<T> {
    return { message, error: null, data } satisfies ApiResponse<T>
  }

  static created<T>(data: T, message = "Created successfully"): ApiResponse<T> {
    return { message, error: null, data } satisfies ApiResponse<T>
  }

  static paginated<T>(
    data: T,
    meta: Meta,
    message = "Success"
  ): ApiResponse<T> {
    return { message, error: null, data, meta } satisfies ApiResponse<T>
  }

  static noContent(message = "No content"): ApiResponse<never> {
    return { message, error: null } satisfies ApiResponse<never>
  }

  static badRequest(
    errors: unknown,
    message = "Bad request"
  ): ApiResponse<never> {
    return { message, error: normalizeError(errors, message) } satisfies ApiResponse<never>
  }

  static unauthorized(message = "Unauthorized"): ApiResponse<never> {
    return { message, error: message } satisfies ApiResponse<never>
  }

  static forbidden(message = "Forbidden"): ApiResponse<never> {
    return { message, error: message } satisfies ApiResponse<never>
  }

  static notFound(message = "Not found"): ApiResponse<never> {
    return { message, error: message } satisfies ApiResponse<never>
  }

  static conflict(message = "Conflict"): ApiResponse<never> {
    return { message, error: message } satisfies ApiResponse<never>
  }

  static unprocessable(
    errors: unknown,
    message = "Validation failed"
  ): ApiResponse<never> {
    return { message, error: normalizeError(errors, message) } satisfies ApiResponse<never>
  }

  static tooMany(message = "Too many requests"): ApiResponse<never> {
    return { message, error: message } satisfies ApiResponse<never>
  }

  static internal(message = "Internal server error"): ApiResponse<never> {
    return { message, error: message } satisfies ApiResponse<never>
  }
}

/** HTTP status to use when mirroring an ApiResponse from an `app/api/**` route handler. */
export const RESPONSE_STATUS = {
  ok: 200,
  created: 201,
  noContent: 204,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
  unprocessable: 422,
  tooMany: 429,
  internal: 500,
} as const

function normalizeError(errors: unknown, fallback: string): Record<string, unknown> {
  if (errors && typeof errors === "object") return errors as Record<string, unknown>
  return { message: fallback }
}
