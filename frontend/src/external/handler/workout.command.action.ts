'use server'

import { withAuth } from '@/features/auth/servers/auth.guard'
import {
  createWorkoutRecordCommand,
  deleteWorkoutRecordCommand,
  updateWorkoutRecordCommand,
} from './workout.command.server'

export const createWorkoutRecordAction = withAuth(async (request: unknown, ctx) => {
  return createWorkoutRecordCommand(request, ctx.session.user.id)
})

export const updateWorkoutRecordAction = withAuth(async (input: { id: string; data: unknown }, ctx) => {
  return updateWorkoutRecordCommand(input, ctx.session.user.id)
})

export const deleteWorkoutRecordAction = withAuth(async (input: { id: string }, ctx) => {
  await deleteWorkoutRecordCommand(input, ctx.session.user.id)
})
