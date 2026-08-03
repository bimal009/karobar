import { Meta } from "./pagination"

export interface ApiResponse<T> {
  status: number
  success: boolean
  message: string
  data?: T
  errors?: unknown
  meta?: Meta
}

export class AppResponse {
  static ok<T>(data: T, message = "Success"): ApiResponse<T> {
    return {
      status: 200,
      success: true,
      message,
      data,
    } satisfies ApiResponse<T>
  }

  static created<T>(data: T, message = "Created successfully"): ApiResponse<T> {
    return {
      status: 201,
      success: true,
      message,
      data,
    } satisfies ApiResponse<T>
  }

  static paginated<T>(
    data: T,
    meta: Meta,
    message = "Success"
  ): ApiResponse<T> {
    return {
      status: 200,
      success: true,
      message,
      data,
      meta,
    } satisfies ApiResponse<T>
  }

  static noContent(message = "No content"): ApiResponse<never> {
    return {
      status: 204,
      success: true,
      message,
    } satisfies ApiResponse<never>
  }

  static badRequest(
    errors: unknown,
    message = "Bad request"
  ): ApiResponse<never> {
    return {
      status: 400,
      success: false,
      message,
      errors,
    } satisfies ApiResponse<never>
  }

  static unauthorized(message = "Unauthorized"): ApiResponse<never> {
    return {
      status: 401,
      success: false,
      message,
    } satisfies ApiResponse<never>
  }

  static forbidden(message = "Forbidden"): ApiResponse<never> {
    return {
      status: 403,
      success: false,
      message,
    } satisfies ApiResponse<never>
  }

  static notFound(message = "Not found"): ApiResponse<never> {
    return {
      status: 404,
      success: false,
      message,
    } satisfies ApiResponse<never>
  }

  static conflict(message = "Conflict"): ApiResponse<never> {
    return {
      status: 409,
      success: false,
      message,
    } satisfies ApiResponse<never>
  }

  static unprocessable(
    errors: unknown,
    message = "Validation failed"
  ): ApiResponse<never> {
    return {
      status: 422,
      success: false,
      message,
      errors,
    } satisfies ApiResponse<never>
  }

  static tooMany(message = "Too many requests"): ApiResponse<never> {
    return {
      status: 429,
      success: false,
      message,
    } satisfies ApiResponse<never>
  }

  static internal(message = "Internal server error"): ApiResponse<never> {
    return {
      status: 500,
      success: false,
      message,
    } satisfies ApiResponse<never>
  }
}
