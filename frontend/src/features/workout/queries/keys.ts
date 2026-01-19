export const workoutKeys = {
  all: ['workout-records'] as const,
  lists: () => [...workoutKeys.all, 'list'] as const,
  list: (filters: { from: string; to: string }) =>
    [...workoutKeys.lists(), filters] as const,
}
