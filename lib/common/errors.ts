import { AppResponse } from "./response";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {}
export class ConflictError extends AppError {}
export class NotFoundError extends AppError {}
export class UnauthorizedError extends AppError {}
export class ForbiddenError extends AppError {}
export class InternalServerError extends AppError {}
export class BadRequestError extends AppError {}
export class ServiceUnavailableError extends AppError {}

const PG_UNIQUE_VIOLATION = "23505";

export const handleError = (label: string, error: unknown) => {
  console.error(`${label} error:`, error);

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === PG_UNIQUE_VIOLATION
  ) {
    return AppResponse.conflict("A record with the same unique value already exists.");
  }

  if (error instanceof ValidationError) {
    return AppResponse.unprocessable(
      error.details,
      error.message
    );
  }

  if (error instanceof BadRequestError) {
    return AppResponse.badRequest(
      error.details,
      error.message
    );
  }

  if (error instanceof ConflictError) {
    return AppResponse.conflict(error.message);
  }

  if (error instanceof NotFoundError) {
    return AppResponse.notFound(error.message);
  }

  if (error instanceof UnauthorizedError) {
    return AppResponse.unauthorized(error.message);
  }

  if (error instanceof ForbiddenError) {
    return AppResponse.forbidden(error.message);
  }

  if (error instanceof ServiceUnavailableError) {
    return AppResponse.tooMany(error.message);
  }

  if (error instanceof InternalServerError) {
    return AppResponse.internal(error.message);
  }

  return AppResponse.internal(
    error instanceof Error
      ? error.message
      : "Internal Server Error"
  );
};