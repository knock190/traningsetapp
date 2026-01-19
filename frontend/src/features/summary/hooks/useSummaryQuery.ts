'use client'

import { useQuery } from '@tanstack/react-query'
import { summaryKeys } from '../queries/keys'
import { getMonthlySummaryAction, getWeeklySummaryAction } from '@/external/handler/workout.query.action'

export function useWeeklySummaryQuery(weekStart: string) {
  return useQuery({
    queryKey: summaryKeys.weekly(weekStart),
    queryFn: () => getWeeklySummaryAction({ weekStart }),
  })
}

export function useMonthlySummaryQuery(month: string) {
  return useQuery({
    queryKey: summaryKeys.monthly(month),
    queryFn: () => getMonthlySummaryAction({ month }),
  })
}
