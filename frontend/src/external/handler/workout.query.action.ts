'use server'

import {
  getMonthlySummaryQuery,
  getWeeklySummaryQuery,
  listWorkoutRecordsServer,
} from './workout.query.server'
import type { MonthlySummaryDto, WeeklySummaryDto } from '../dto/workout.dto'
import { withAuth } from '@/features/auth/servers/auth.guard'

export const listWorkoutRecordsAction = withAuth(async (input: { from: string; to: string }) => {
  return listWorkoutRecordsServer(input.from, input.to)
})

export const getWeeklySummaryAction = withAuth(
  async (input: { weekStart: string }): Promise<WeeklySummaryDto> => {
    return getWeeklySummaryQuery(input.weekStart)
  }
)

export const getMonthlySummaryAction = withAuth(
  async (input: { month: string }): Promise<MonthlySummaryDto> => {
    return getMonthlySummaryQuery(input.month)
  }
)
