import 'server-only'

import { listRecords } from '../service/workout.service'
import type { WorkoutRecordDto } from '../dto/workout.dto'

export async function listWorkoutRecordsServer(from: string, to: string): Promise<WorkoutRecordDto[]> {
  const records = await listRecords(from, to)
  return records.map((record) => ({
    id: record.id,
    date: record.date,
    exerciseName: record.exerciseName,
    reps: record.reps,
    sets: record.sets,
    note: record.note ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  }))
}
