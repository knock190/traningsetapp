'use server'

import { listWorkoutRecordsServer } from './workout.query.server'
import { getMonthRange, getWeekRange, formatDateYmd } from '@/shared/lib/date'
import type { MonthlySummaryDto, WeeklySummaryDto } from '../dto/workout.dto'
import { listRecords } from '../service/workout.service'

export async function listWorkoutRecordsAction(input: { from: string; to: string }) {
  return listWorkoutRecordsServer(input.from, input.to)
}

export async function getWeeklySummaryAction(input: { weekStart: string }): Promise<WeeklySummaryDto> {
  const start = new Date(input.weekStart)
  const range = getWeekRange(start)
  const from = formatDateYmd(range.start)
  const to = formatDateYmd(range.end)
  const records = await listRecords(from, to)

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

export async function getMonthlySummaryAction(input: { month: string }): Promise<MonthlySummaryDto> {
  const [year, month] = input.month.split('-').map(Number)
  const range = getMonthRange(new Date(year, month - 1, 1))
  const from = formatDateYmd(range.start)
  const to = formatDateYmd(range.end)
  const records = await listRecords(from, to)

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
