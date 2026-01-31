import 'server-only'

import type { WorkoutRecordInput } from '../dto/workout.dto'
import * as api from './workout/workout.api'
import * as db from './workout/workout.db'

const dataSource = process.env.WORKOUT_DATA_SOURCE ?? 'db'

class WorkoutService {
  private useApi() {
    return dataSource === 'api'
  }

  async listRecords({ from, to }: { from: string; to: string }) {
    return this.useApi() ? api.listRecords(from, to) : db.listRecords(from, to)
  }

  async createRecord(input: WorkoutRecordInput) {
    return this.useApi() ? api.createRecord(input) : db.createRecord(input)
  }

  async updateRecord(id: string, input: WorkoutRecordInput) {
    return this.useApi() ? api.updateRecord(id, input) : db.updateRecord(id, input)
  }

  async deleteRecord(id: string) {
    return this.useApi() ? api.deleteRecord(id) : db.deleteRecord(id)
  }
}

export const workoutService = new WorkoutService()
