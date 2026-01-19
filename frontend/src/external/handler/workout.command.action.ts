'use server'

import { WorkoutRecordInputSchema } from '../dto/workout.dto'
import { createRecord, deleteRecord, updateRecord } from '../service/workout.service'

export async function createWorkoutRecordAction(request: unknown) {
  const validated = WorkoutRecordInputSchema.parse(request)
  return createRecord(validated)
}

export async function updateWorkoutRecordAction(input: { id: string; data: unknown }) {
  const validated = WorkoutRecordInputSchema.parse(input.data)
  return updateRecord(input.id, validated)
}

export async function deleteWorkoutRecordAction(input: { id: string }) {
  await deleteRecord(input.id)
}
