import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { errorHandler, notFoundHandler } from '../middleware/errors.js'

describe('API error shape', () => {
  it('returns the shared error contract for unknown routes', () => {
    let capturedError: unknown
    notFoundHandler({ method: 'GET', path: '/api/not-real' } as any, {} as any, (error: unknown) => {
      capturedError = error
    })

    const response = {
      statusCode: 0,
      body: undefined as unknown,
      status(code: number) {
        this.statusCode = code
        return this
      },
      json(payload: unknown) {
        this.body = payload
        return this
      },
    }

    errorHandler(capturedError, {} as any, response as any, () => undefined)

    assert.equal(response.statusCode, 404)
    assert.equal((response.body as any).error.code, 'not_found')
    assert.equal(typeof (response.body as any).error.message, 'string')
  })
})
