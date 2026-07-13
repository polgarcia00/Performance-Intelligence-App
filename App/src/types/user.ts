export type DistanceUnit = 'km' | 'mi'
export type WeightUnit = 'kg' | 'lb'

export interface User {
  id: string
  name: string
  timezone: string
  preferredDistanceUnit: DistanceUnit
  preferredWeightUnit: WeightUnit
  baselineStartDate: string
  baselineEndDate: string
}

