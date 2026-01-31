import { and, eq, gte, lte } from 'drizzle-orm'
import { db } from '@/external/client/db'
import { workoutRecords } from '@/external/db/schema'
import type { WorkoutRecordInput } from '@/external/dto/workout.dto'

export async function listRecords(from: string, to: string) {
  return db
    .select()
    .from(workoutRecords)
    .where(and(gte(workoutRecords.date, from), lte(workoutRecords.date, to)))
}

export async function createRecord(input: WorkoutRecordInput) {
  const now = new Date()
  const record = {
    id: crypto.randomUUID(),
    ...input,
    createdAt: now,
    updatedAt: now,
  }

  await db.insert(workoutRecords).values(record)
  return record
}

export async function updateRecord(id: string, input: WorkoutRecordInput) {
  const now = new Date()
  const record = {
    ...input,
    updatedAt: now,
  }

  await db.update(workoutRecords).set(record).where(eq(workoutRecords.id, id))
  return { id, ...record }
}

export async function deleteRecord(id: string) {
  await db.delete(workoutRecords).where(eq(workoutRecords.id, id))
}
