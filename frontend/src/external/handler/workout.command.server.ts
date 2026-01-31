import 'server-only'

import { WorkoutRecordInputSchema } from '../dto/workout.dto'
import { workoutService } from '../service/workout.service'

export async function createWorkoutRecordCommand(request: unknown) {
  const validated = WorkoutRecordInputSchema.parse(request)
  return workoutService.createRecord(validated)
}

export async function updateWorkoutRecordCommand(input: { id: string; data: unknown }) {
  const validated = WorkoutRecordInputSchema.parse(input.data)
  return workoutService.updateRecord(input.id, validated)
}

export async function deleteWorkoutRecordCommand(input: { id: string }) {
  await workoutService.deleteRecord(input.id)
}
