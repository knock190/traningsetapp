import { and, eq, gte, lte } from 'drizzle-orm'
import { db } from '@/external/client/db'
import { workoutRecords } from '@/external/db/schema'
import type { WorkoutRecordInput } from '@/external/dto/workout.dto'

export async function listRecords(ownerId: string, from: string, to: string) {
  return db
    .select()
    .from(workoutRecords)
    .where(
      and(
        eq(workoutRecords.ownerId, ownerId),
        gte(workoutRecords.date, from),
        lte(workoutRecords.date, to)
      )
    )
}

export async function createRecord(ownerId: string, input: WorkoutRecordInput) {
  const now = new Date()
  const record = {
    id: crypto.randomUUID(),
    ownerId,
    ...input,
    createdAt: now,
    updatedAt: now,
  }

  await db.insert(workoutRecords).values(record)
  return record
}

export async function updateRecord(ownerId: string, id: string, input: WorkoutRecordInput) {
  const now = new Date()
  const record = {
    ...input,
    updatedAt: now,
  }

  await db
    .update(workoutRecords)
    .set(record)
    .where(and(eq(workoutRecords.id, id), eq(workoutRecords.ownerId, ownerId)))
  return { id, ...record }
}

export async function deleteRecord(ownerId: string, id: string) {
  await db.delete(workoutRecords).where(and(eq(workoutRecords.id, id), eq(workoutRecords.ownerId, ownerId)))
}
