'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { workoutKeys } from '../queries/keys'
import {
  createWorkoutRecordAction,
  deleteWorkoutRecordAction,
  updateWorkoutRecordAction,
} from '@/external/handler/workout.command.action'

export function useCreateWorkoutMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createWorkoutRecordAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.lists() })
    },
  })
}

export function useUpdateWorkoutMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateWorkoutRecordAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.lists() })
    },
  })
}

export function useDeleteWorkoutMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteWorkoutRecordAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutKeys.lists() })
    },
  })
}
