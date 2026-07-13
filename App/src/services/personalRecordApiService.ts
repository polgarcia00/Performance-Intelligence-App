import type { PersonalRecord } from '@/types'
import { fetchPersonalRecords } from './performanceApiService'

export async function fetchPersonalRecordList(): Promise<PersonalRecord[]> {
  return fetchPersonalRecords()
}
