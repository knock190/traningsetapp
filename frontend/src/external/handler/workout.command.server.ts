import 'server-only'

import { WorkoutRecordInputSchema } from '../dto/workout.dto'
import { workoutService } from '../service/workout.service'

export async function createWorkoutRecordCommand(request: unknown, ownerId: string) {
  const validated = WorkoutRecordInputSchema.parse(request)
  return workoutService.createRecord(ownerId, validated)
}

export async function updateWorkoutRecordCommand(
  input: { id: string; data: unknown },
  ownerId: string
) {
  const validated = WorkoutRecordInputSchema.parse(input.data)
  return workoutService.updateRecord(ownerId, input.id, validated)
}

export async function deleteWorkoutRecordCommand(input: { id: string }, ownerId: string) {
  await workoutService.deleteRecord(ownerId, input.id)
}
