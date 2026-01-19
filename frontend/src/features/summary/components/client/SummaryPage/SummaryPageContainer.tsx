'use client'

import { SummaryPagePresenter } from './SummaryPagePresenter'
import { useSummaryPage } from './useSummaryPage'

export function SummaryPageContainer() {
  const { tab, setTab, weeklyBreakdown, monthlyBreakdown, isLoading } = useSummaryPage()

  return (
    <SummaryPagePresenter
      tab={tab}
      weeklyBreakdown={weeklyBreakdown}
      monthlyBreakdown={monthlyBreakdown}
      isLoading={isLoading}
      onTabChange={setTab}
    />
  )
}
