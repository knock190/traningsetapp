import 'server-only'

import type { WorkoutRecordInput } from '../dto/workout.dto'
import * as api from './workout/workout.api'
import * as db from './workout/workout.db'

const dataSource = process.env.WORKOUT_DATA_SOURCE ?? 'db'

class WorkoutService {
  private useApi() {
    return dataSource === 'api'
  }

  async listRecords({ ownerId, from, to }: { ownerId: string; from: string; to: string }) {
    return this.useApi()
      ? api.listRecords(ownerId, from, to)
      : db.listRecords(ownerId, from, to)
  }

  async createRecord(ownerId: string, input: WorkoutRecordInput) {
    return this.useApi()
      ? api.createRecord(ownerId, input)
      : db.createRecord(ownerId, input)
  }

  async updateRecord(ownerId: string, id: string, input: WorkoutRecordInput) {
    return this.useApi()
      ? api.updateRecord(ownerId, id, input)
      : db.updateRecord(ownerId, id, input)
  }

  async deleteRecord(ownerId: string, id: string) {
    return this.useApi()
      ? api.deleteRecord(ownerId, id)
      : db.deleteRecord(ownerId, id)
  }
}

export const workoutService = new WorkoutService()
