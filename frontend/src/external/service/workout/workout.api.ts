import type { WorkoutRecordInput } from '@/external/dto/workout.dto'

function apiNotConfigured(): never {
  throw new Error('Workout API data source is not configured.')
}

export async function listRecords(_from: string, _to: string) {
  return apiNotConfigured()
}

export async function createRecord(_input: WorkoutRecordInput) {
  return apiNotConfigured()
}

export async function updateRecord(_id: string, _input: WorkoutRecordInput) {
  return apiNotConfigured()
}

export async function deleteRecord(_id: string) {
  return apiNotConfigured()
}
