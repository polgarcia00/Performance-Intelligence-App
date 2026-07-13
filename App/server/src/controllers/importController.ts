import type { Request, Response } from 'express'
import { ImportService } from '../modules/imports/importService.js'
import { parseMultipartImportFiles } from '../modules/imports/multipartParser.js'

export class ImportController {
  constructor(private importService = new ImportService()) {}

  async preview(request: Request, response: Response): Promise<void> {
    const contentType = String(request.headers?.['content-type'] ?? '')
    const files = contentType.includes('multipart/form-data') ? await parseMultipartImportFiles(request) : request.body?.files ?? []
    const preview = await this.importService.previewImport(files)
    response.status(200).json({ data: preview })
  }

  async confirm(request: Request, response: Response): Promise<void> {
    const result = await this.importService.confirmImport(String(request.body?.previewId ?? ''))
    response.status(201).json({ data: result })
  }

  async list(_request: Request, response: Response): Promise<void> {
    const result = await this.importService.listImports()
    response.status(200).json({ data: result })
  }

  async detail(request: Request, response: Response): Promise<void> {
    const result = await this.importService.getImport(String(request.params.id ?? ''))
    response.status(200).json({ data: result })
  }
}
