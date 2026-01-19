import { z } from 'zod'

export const WorkoutRecordInputSchema = z.object({
  date: z.string(),
  exerciseName: z.string().min(1),
  reps: z.number().int().min(0),
  sets: z.number().int().min(0),
  note: z.string().optional(),
})

export const WorkoutRecordSchema = WorkoutRecordInputSchema.extend({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type WorkoutRecordInput = z.infer<typeof WorkoutRecordInputSchema>
export type WorkoutRecordDto = z.infer<typeof WorkoutRecordSchema>

export type WeeklySummaryDto = {
  weekRange: { start: string; end: string }
  totalSets: number
  dailyBreakdown: { date: string; totalSets: number }[]
}

export type MonthlySummaryDto = {
  monthRange: { start: string; end: string }
  totalSets: number
  weeklyBreakdown: { weekRange: { start: string; end: string }; totalSets: number }[]
}
