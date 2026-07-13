import type { NextFunction, Request, Response } from 'express'
import { isProduction } from '../config/env.js'

export class AppError extends Error {
  statusCode: number
  code: string
  fieldErrors?: Record<string, string[]>
  details?: unknown

  constructor(statusCode: number, code: string, message: string, options: { fieldErrors?: Record<string, string[]>; details?: unknown } = {}) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.fieldErrors = options.fieldErrors
    this.details = options.details
  }
}

export function asyncHandler(handler: (request: Request, response: Response, next: NextFunction) => Promise<unknown>) {
  return (request: Request, response: Response, next: NextFunction) => {
    handler(request, response, next).catch(next)
  }
}

export function notFoundHandler(request: Request, _response: Response, next: NextFunction): void {
  next(new AppError(404, 'not_found', `Route ${request.method} ${request.path} was not found.`))
}

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction): void {
  const appError =
    error instanceof AppError
      ? error
      : new AppError(500, 'internal_error', 'An unexpected backend error occurred.', { details: error instanceof Error ? error.message : error })

  response.status(appError.statusCode).json({
    error: {
      code: appError.code,
      message: appError.message,
      ...(appError.fieldErrors ? { fieldErrors: appError.fieldErrors } : {}),
      ...(!isProduction() && appError.details ? { details: appError.details } : {}),
    },
  })
}
