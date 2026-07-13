declare module 'express' {
  const express: any
  export default express
  export type Request = any
  export type Response = any
  export type NextFunction = any
}

declare module 'pg' {
  export const Pool: any
}

declare module 'dotenv' {
  export function config(): void
}

declare module 'csv-parse/sync' {
  export function parse(content: string, options?: Record<string, unknown>): Array<Record<string, string>>
}

declare module 'supertest' {
  const request: any
  export default request
}

declare module 'node:crypto' {
  export function createHash(algorithm: string): {
    update(value: string): { digest(encoding: string): string }
    digest(encoding: string): string
  }
  export function randomUUID(): string
}

declare module 'node:fs/promises' {
  export function readdir(path: string): Promise<string[]>
  export function readFile(path: string, encoding: string): Promise<string>
}

declare module 'node:path' {
  export function join(...paths: string[]): string
  export function dirname(path: string): string
}

declare module 'node:url' {
  export function fileURLToPath(url: string): string
}

declare module 'node:test' {
  export function describe(name: string, fn: () => void | Promise<void>): void
  export function it(name: string, fn: () => void | Promise<void>): void
  export function before(fn: () => void | Promise<void>): void
  export function after(fn: () => void | Promise<void>): void
  export function beforeEach(fn: () => void | Promise<void>): void
}

declare module 'node:assert/strict' {
  const assert: any
  export default assert
}

declare const Buffer: {
  concat(chunks: unknown[]): { length: number; toString(encoding?: string): string }
}

declare const process: {
  env: Record<string, string | undefined>
  argv?: string[]
  exit(code?: number): never
}

declare const console: {
  log(...values: unknown[]): void
  error(...values: unknown[]): void
}

declare const URL: {
  new (input: string): { pathname: string }
}
