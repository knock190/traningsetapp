'use client'

import { WorkoutPagePresenter } from './WorkoutPagePresenter'
import { useWorkoutPage } from './useWorkoutPage'

export function WorkoutPageContainer() {
  const {
    records,
    form,
    editingId,
    todayTotal,
    isLoading,
    handleChange,
    handleSubmit,
    handleEdit,
    handleDelete,
  } = useWorkoutPage()

  return (
    <WorkoutPagePresenter
      records={records}
      form={form}
      editingId={editingId}
      todayTotal={todayTotal}
      isLoading={isLoading}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )
}
