'use client'

import { useMemo, useState } from 'react'
import { useWorkoutListQuery } from '@/features/workout/hooks/useWorkoutQuery'
import {
  useCreateWorkoutMutation,
  useDeleteWorkoutMutation,
  useUpdateWorkoutMutation,
} from '@/features/workout/hooks/useWorkoutMutation'
import { formatDateYmd } from '@/shared/lib/date'

export type WorkoutRecord = {
  id: string
  date: string
  exerciseName: string
  reps: number
  sets: number
  note?: string
}

const todayYmd = () => formatDateYmd(new Date())

export function useWorkoutPage() {
  const [form, setForm] = useState({
    date: todayYmd(),
    exerciseName: '',
    reps: 0,
    sets: 1,
    note: '',
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data: records = [], isLoading } = useWorkoutListQuery(form.date, form.date)
  const createMutation = useCreateWorkoutMutation()
  const updateMutation = useUpdateWorkoutMutation()
  const deleteMutation = useDeleteWorkoutMutation()

  const todayTotal = useMemo(() => {
    return records.reduce((sum, record) => sum + record.sets, 0)
  }, [records])

  const handleChange = (name: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]:
        name === 'reps' || name === 'sets' ? Number.parseInt(value, 10) || 0 : value,
    }))
  }

  const handleSubmit = async () => {
    if (!form.exerciseName.trim()) return

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, data: form })
    } else {
      await createMutation.mutateAsync(form)
    }

    setEditingId(null)
    setForm((prev) => ({ ...prev, exerciseName: '', reps: 0, sets: 1, note: '' }))
  }

  const handleEdit = (record: WorkoutRecord) => {
    setEditingId(record.id)
    setForm({
      date: record.date,
      exerciseName: record.exerciseName,
      reps: record.reps,
      sets: record.sets,
      note: record.note ?? '',
    })
  }

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync({ id })
  }

  return {
    records,
    form,
    editingId,
    todayTotal,
    isLoading,
    handleChange,
    handleSubmit,
    handleEdit,
    handleDelete,
  }
}
