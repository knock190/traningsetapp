'use client'

import { useMemo, useState } from 'react'
import { useMonthlySummaryQuery, useWeeklySummaryQuery } from '@/features/summary/hooks/useSummaryQuery'
import { formatDateYmd, formatMonthYm, getWeekRange } from '@/shared/lib/date'

export type WeeklyBreakdown = { label: string; totalSets: number }
export type MonthlyBreakdown = { label: string; totalSets: number }

export function useSummaryPage() {
  const [tab, setTab] = useState<'week' | 'month'>('week')
  const today = useMemo(() => new Date(), [])
  const weekStart = formatDateYmd(getWeekRange(today).start)
  const month = formatMonthYm(today)

  const weeklyQuery = useWeeklySummaryQuery(weekStart)
  const monthlyQuery = useMonthlySummaryQuery(month)

  const weeklyBreakdown = useMemo<WeeklyBreakdown[]>(() => {
    return (
      weeklyQuery.data?.dailyBreakdown.map((item) => ({
        label: item.date,
        totalSets: item.totalSets,
      })) ?? []
    )
  }, [weeklyQuery.data])

  const monthlyBreakdown = useMemo<MonthlyBreakdown[]>(() => {
    return (
      monthlyQuery.data?.weeklyBreakdown.map((item) => ({
        label: `${item.weekRange.start}~${item.weekRange.end}`,
        totalSets: item.totalSets,
      })) ?? []
    )
  }, [monthlyQuery.data])

  return {
    tab,
    setTab,
    weeklyBreakdown,
    monthlyBreakdown,
    isLoading: weeklyQuery.isLoading || monthlyQuery.isLoading,
  }
}
