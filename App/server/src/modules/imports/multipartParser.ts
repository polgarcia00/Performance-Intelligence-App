import { env } from '../../config/env.js'
import { AppError } from '../../middleware/errors.js'
import type { ImportFileInput } from '../../types/domain.js'

function boundaryFromContentType(contentType: string): string | null {
  const match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i)
  return match?.[1] ?? match?.[2] ?? null
}

function unquote(value: string): string {
  return value.replace(/^"|"$/g, '')
}

function fileNameFromDisposition(disposition: string): string | null {
  const match = disposition.match(/filename=("[^"]+"|[^;]+)/i)
  return match ? unquote(match[1].trim()) : null
}

export async function parseMultipartImportFiles(request: any): Promise<ImportFileInput[]> {
  const contentType = String(request.headers?.['content-type'] ?? '')
  const boundary = boundaryFromContentType(contentType)
  if (!boundary) {
    throw new AppError(400, 'invalid_upload', 'Multipart upload is missing a boundary.')
  }

  const chunks: unknown[] = []
  let size = 0

  await new Promise<void>((resolve, reject) => {
    request.on('data', (chunk: { length: number }) => {
      size += chunk.length
      if (size > env.uploadSizeLimit) {
        reject(new AppError(413, 'upload_too_large', 'Import upload exceeds the configured size limit.'))
        return
      }
      chunks.push(chunk)
    })
    request.on('end', resolve)
    request.on('error', reject)
  })

  const rawBody = Buffer.concat(chunks).toString('utf8')
  const files: ImportFileInput[] = []

  for (const rawPart of rawBody.split(`--${boundary}`)) {
    const part = rawPart.trim()
    if (!part || part === '--') continue

    const [rawHeaders, ...bodyParts] = part.split(/\r?\n\r?\n/)
    const body = bodyParts.join('\n\n').replace(/\r?\n--$/, '')
    const disposition = rawHeaders
      .split(/\r?\n/)
      .find((line) => line.toLowerCase().startsWith('content-disposition:'))
      ?.replace(/^content-disposition:\s*/i, '')
    if (!disposition) continue

    const fileName = fileNameFromDisposition(disposition)
    if (!fileName) continue

    if (!/\.(csv|json)$/i.test(fileName)) {
      throw new AppError(415, 'unsupported_import_file', `Unsupported import file "${fileName}". Upload CSV or JSON files.`)
    }

    files.push({ fileName, content: body.replace(/\r?\n$/, '') })
  }

  if (!files.length) {
    throw new AppError(422, 'validation_failed', 'Upload at least one CSV or JSON file.', {
      fieldErrors: { files: ['Upload at least one CSV or JSON file.'] },
    })
  }

  return files
}
