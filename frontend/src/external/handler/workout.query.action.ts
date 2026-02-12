'use server'

import {
  getMonthlySummaryQuery,
  getWeeklySummaryQuery,
  listWorkoutRecordsServer,
} from './workout.query.server'
import type { MonthlySummaryDto, WeeklySummaryDto } from '../dto/workout.dto'
import { withAuth } from '@/features/auth/servers/auth.guard'

export const listWorkoutRecordsAction = withAuth(
  async (input: { from: string; to: string }, ctx) => {
    return listWorkoutRecordsServer(ctx.session.user.id, input.from, input.to)
  }
)

export const getWeeklySummaryAction = withAuth(
  async (input: { weekStart: string }, ctx): Promise<WeeklySummaryDto> => {
    return getWeeklySummaryQuery(ctx.session.user.id, input.weekStart)
  }
)

export const getMonthlySummaryAction = withAuth(
  async (input: { month: string }, ctx): Promise<MonthlySummaryDto> => {
    return getMonthlySummaryQuery(ctx.session.user.id, input.month)
  }
)
