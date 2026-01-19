import { Button } from '@/shared/components/ui/Button'
import type { MonthlyBreakdown, WeeklyBreakdown } from './useSummaryPage'

type Props = {
  tab: 'week' | 'month'
  weeklyBreakdown: WeeklyBreakdown[]
  monthlyBreakdown: MonthlyBreakdown[]
  isLoading: boolean
  onTabChange: (tab: 'week' | 'month') => void
}

export function SummaryPagePresenter({
  tab,
  weeklyBreakdown,
  monthlyBreakdown,
  isLoading,
  onTabChange,
}: Props) {
  const breakdown = tab === 'week' ? weeklyBreakdown : monthlyBreakdown
  const total = breakdown.reduce((sum, item) => sum + item.totalSets, 0)

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            variant={tab === 'week' ? 'primary' : 'secondary'}
            onClick={() => onTabChange('week')}
          >
            週
          </Button>
          <Button
            variant={tab === 'month' ? 'primary' : 'secondary'}
            onClick={() => onTabChange('month')}
          >
            月
          </Button>
        </div>
        <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm">
          期間合計: <span className="font-semibold">{total}</span> セット
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold">
          {tab === 'week' ? '日別合計' : '週別合計'}
        </h3>
        <div className="mt-4 grid gap-3">
          {isLoading ? (
            <p className="text-sm text-neutral-500">集計中...</p>
          ) : (
            breakdown.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-sm"
              >
                <span>{item.label}</span>
                <span className="font-medium">{item.totalSets} セット</span>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h3 className="text-base font-semibold">グラフ</h3>
        <div className="mt-4 flex h-40 items-end gap-2 rounded-md border border-dashed border-neutral-200 bg-neutral-50 p-3">
          {breakdown.map((item) => (
            <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="h-full w-full rounded bg-neutral-200" />
              <span className="text-[10px] text-neutral-500">{item.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
