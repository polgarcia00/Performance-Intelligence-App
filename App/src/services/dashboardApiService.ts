import { apiGet } from './apiClient'

export async function fetchDashboardSummary(): Promise<any> {
  return apiGet('/dashboard/summary')
}
