import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { AppError } from '../middleware/errors.js'
import { parseMultipartImportFiles } from '../modules/imports/multipartParser.js'

function multipartRequest(fileName: string, content: string) {
  const boundary = 'performance-journal-test-boundary'
  const body = [
    `--${boundary}`,
    `Content-Disposition: form-data; name="files"; filename="${fileName}"`,
    'Content-Type: application/octet-stream',
    '',
    content,
    `--${boundary}--`,
    '',
  ].join('\r\n')
  return {
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    on(event: string, handler: (value?: unknown) => void) {
      if (event === 'data') handler(new TextEncoder().encode(body))
      if (event === 'end') handler()
      return this
    },
  }
}

describe('multipart import parser', () => {
  it('accepts a Zepp workout CSV upload', async () => {
    const files = await parseMultipartImportFiles(multipartRequest('SPORT.csv', 'type,startTime\n1,2026-07-07T10:00:00Z'))

    assert.equal(files.length, 1)
    assert.equal(files[0].fileName, 'SPORT.csv')
    assert.match(files[0].content, /type,startTime/)
  })

  it('directs unsupported uploads to a Zepp workout CSV', async () => {
    await assert.rejects(
      () => parseMultipartImportFiles(multipartRequest('workouts.zip', 'not-a-csv')),
      (error: unknown) => {
        if (!(error instanceof AppError)) return false
        assert.equal(error.statusCode, 415)
        assert.equal(error.code, 'unsupported_import_file')
        assert.match(error.message, /Upload SPORT\.csv or another Zepp workout CSV file\./)
        return true
      },
    )
  })
})
