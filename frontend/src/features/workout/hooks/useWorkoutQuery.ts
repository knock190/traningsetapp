'use client'

import { useQuery } from '@tanstack/react-query'
import { workoutKeys } from '../queries/keys'
import { listWorkoutRecordsAction } from '@/external/handler/workout.query.action'

export function useWorkoutListQuery(from: string, to: string) {
  return useQuery({
    queryKey: workoutKeys.list({ from, to }),
    queryFn: () => listWorkoutRecordsAction({ from, to }),
  })
}
