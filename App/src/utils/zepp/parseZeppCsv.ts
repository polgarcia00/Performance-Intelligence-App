function cleanCell(value: string): string {
  return value.trim().replace(/^\uFEFF/, '')
}

function parseCsvRecords(content: string): string[][] {
  const records: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index]
    const nextCharacter = content[index + 1]

    if (character === '"' && nextCharacter === '"') {
      cell += '"'
      index += 1
      continue
    }

    if (character === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (character === ',' && !inQuotes) {
      row.push(cleanCell(cell))
      cell = ''
      continue
    }

    if ((character === '\n' || character === '\r') && !inQuotes) {
      if (character === '\r' && nextCharacter === '\n') {
        index += 1
      }
      row.push(cleanCell(cell))
      if (row.some((value) => value !== '')) {
        records.push(row)
      }
      row = []
      cell = ''
      continue
    }

    cell += character
  }

  row.push(cleanCell(cell))
  if (row.some((value) => value !== '')) {
    records.push(row)
  }

  return records
}

export function parseZeppCsv(content: string): Array<Record<string, string>> {
  const records = parseCsvRecords(content)
  const headers = records[0]?.map(cleanCell).filter(Boolean) ?? []

  if (!headers.length) {
    return []
  }

  return records.slice(1).map((record) =>
    headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = record[index] ?? ''
      return row
    }, {}),
  )
}

export function readZeppCsvHeaders(content: string): string[] {
  return parseCsvRecords(content)[0]?.map(cleanCell).filter(Boolean) ?? []
}
