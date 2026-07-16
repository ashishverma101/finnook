import { client } from './client'

export interface Goal {
  id: number
  goal_name: string
  target_amount: number
  saved_amount: number
  deadline: string
}

export interface GoalCreate {
  goal_name: string
  target_amount: number
  deadline: string
}

export const goalsApi = {
  getAll: () => client.get<Goal[]>('/goals/'),

  create: (data: GoalCreate) =>
    client.post<Goal>('/goals/', data),

  updateSaved: (id: number, saved_amount: number) =>
    client.patch<Goal>(`/goals/${id}`, { saved_amount }),

  delete: (id: number) =>
    client.delete<{ message: string }>(`/goals/${id}`),
}