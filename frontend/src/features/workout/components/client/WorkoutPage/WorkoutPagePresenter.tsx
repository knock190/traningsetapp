import { Button } from '@/shared/components/ui/Button'
import type { WorkoutRecord } from './useWorkoutPage'

type Props = {
  form: {
    date: string
    exerciseName: string
    reps: number
    sets: number
    note: string
  }
  editingId: string | null
  todayTotal: number
  records: WorkoutRecord[]
  isLoading: boolean
  onChange: (name: keyof Props['form'], value: string) => void
  onSubmit: () => void
  onEdit: (record: WorkoutRecord) => void
  onDelete: (id: string) => void
}

export function WorkoutPagePresenter({
  form,
  editingId,
  todayTotal,
  records,
  isLoading,
  onChange,
  onSubmit,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold">今日の記録</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            日付
            <input
              type="date"
              className="rounded-md border border-neutral-200 px-3 py-2"
              value={form.date}
              onChange={(event) => onChange('date', event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            種目
            <input
              type="text"
              className="rounded-md border border-neutral-200 px-3 py-2"
              value={form.exerciseName}
              onChange={(event) => onChange('exerciseName', event.target.value)}
              placeholder="ベンチプレス"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            セット数
            <input
              type="number"
              min={0}
              className="rounded-md border border-neutral-200 px-3 py-2"
              value={form.sets}
              onChange={(event) => onChange('sets', event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            回数
            <input
              type="number"
              min={0}
              className="rounded-md border border-neutral-200 px-3 py-2"
              value={form.reps}
              onChange={(event) => onChange('reps', event.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm md:col-span-2">
            メモ
            <input
              type="text"
              className="rounded-md border border-neutral-200 px-3 py-2"
              value={form.note}
              onChange={(event) => onChange('note', event.target.value)}
              placeholder="フォーム意識"
            />
          </label>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={onSubmit}>{editingId ? '更新する' : '追加する'}</Button>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">当日の記録一覧</h3>
          <span className="text-sm text-neutral-500">
            今日の合計: {todayTotal} セット
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {isLoading ? (
            <p className="text-sm text-neutral-500">読み込み中...</p>
          ) : records.length === 0 ? (
            <p className="text-sm text-neutral-500">
              今日はまだ記録がありません。最初の記録を追加しましょう。
            </p>
          ) : (
            records.map((record) => (
              <div
                key={record.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200 px-3 py-2"
              >
                <div className="text-sm">
                  <div className="font-medium">{record.exerciseName}</div>
                  <div className="text-neutral-500">
                    {record.date} ・ {record.sets}セット / {record.reps}回
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => onEdit(record)}>
                    編集
                  </Button>
                  <Button variant="ghost" onClick={() => onDelete(record.id)}>
                    削除
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
