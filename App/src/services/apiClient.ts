export interface ApiErrorPayload {
  code: string
  message: string
  fieldErrors?: Record<string, string[]>
  details?: unknown
}

export class ApiClientError extends Error {
  status: number
  code: string
  fieldErrors?: Record<string, string[]>
  details?: unknown

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message)
    this.name = 'ApiClientError'
    this.status = status
    this.code = payload.code
    this.fieldErrors = payload.fieldErrors
    this.details = payload.details
  }
}

const DEFAULT_API_BASE_URL = 'http://localhost:4000/api'

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, '')

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? ''
  const payload = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    throw new ApiClientError(response.status, payload?.error ?? {
      code: 'request_failed',
      message: response.statusText || 'API request failed.',
    })
  }

  return (payload?.data ?? payload) as T
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
  })
  return parseResponse<T>(response)
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return parseResponse<T>(response)
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return parseResponse<T>(response)
}

export async function apiPostForm<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: formData,
  })
  return parseResponse<T>(response)
}
