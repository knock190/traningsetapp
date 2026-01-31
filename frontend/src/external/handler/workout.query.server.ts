import 'server-only'

import { workoutService } from '../service/workout.service'
import type { MonthlySummaryDto, WeeklySummaryDto, WorkoutRecordDto } from '../dto/workout.dto'
import { formatDateYmd, getMonthRange, getWeekRange } from '@/shared/lib/date'

export async function listWorkoutRecordsServer(from: string, to: string): Promise<WorkoutRecordDto[]> {
  const records = await workoutService.listRecords({ from, to })
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

export async function getWeeklySummaryQuery(weekStart: string): Promise<WeeklySummaryDto> {
  const start = new Date(weekStart)
  const range = getWeekRange(start)
  const from = formatDateYmd(range.start)
  const to = formatDateYmd(range.end)
  const records = await workoutService.listRecords({ from, to })

  const breakdown = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(range.start)
    date.setDate(range.start.getDate() + index)
    const dateStr = formatDateYmd(date)
    const totalSets = records
      .filter((record) => record.date === dateStr)
      .reduce((sum, record) => sum + record.sets, 0)
    return { date: dateStr, totalSets }
  })

  return {
    weekRange: { start: from, end: to },
    totalSets: breakdown.reduce((sum, item) => sum + item.totalSets, 0),
    dailyBreakdown: breakdown,
  }
}

export async function getMonthlySummaryQuery(month: string): Promise<MonthlySummaryDto> {
  const [year, monthValue] = month.split('-').map(Number)
  const range = getMonthRange(new Date(year, monthValue - 1, 1))
  const from = formatDateYmd(range.start)
  const to = formatDateYmd(range.end)
  const records = await workoutService.listRecords({ from, to })

  const weeklyBreakdown = []
  let cursor = new Date(range.start)
  while (cursor <= range.end) {
    const weekRange = getWeekRange(cursor)
    const weekStart = formatDateYmd(weekRange.start)
    const weekEnd = formatDateYmd(weekRange.end)
    const totalSets = records
      .filter((record) => record.date >= weekStart && record.date <= weekEnd)
      .reduce((sum, record) => sum + record.sets, 0)
    weeklyBreakdown.push({
      weekRange: { start: weekStart, end: weekEnd },
      totalSets,
    })
    cursor.setDate(cursor.getDate() + 7)
  }

  return {
    monthRange: { start: from, end: to },
    totalSets: weeklyBreakdown.reduce((sum, item) => sum + item.totalSets, 0),
    weeklyBreakdown,
  }
}
