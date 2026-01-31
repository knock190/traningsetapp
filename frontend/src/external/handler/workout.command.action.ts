'use server'

import { withAuth } from '@/features/auth/servers/auth.guard'
import {
  createWorkoutRecordCommand,
  deleteWorkoutRecordCommand,
  updateWorkoutRecordCommand,
} from './workout.command.server'

export const createWorkoutRecordAction = withAuth(async (request: unknown) => {
  return createWorkoutRecordCommand(request)
})

export const updateWorkoutRecordAction = withAuth(async (input: { id: string; data: unknown }) => {
  return updateWorkoutRecordCommand(input)
})

export const deleteWorkoutRecordAction = withAuth(async (input: { id: string }) => {
  await deleteWorkoutRecordCommand(input)
})
