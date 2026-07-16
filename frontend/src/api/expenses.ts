import { client } from './client'
import { Expense, ExpenseCreate } from '../types'

export const expensesApi = {
  getAll: () => client.get<Expense[]>('/expenses/'),

  create: (data: ExpenseCreate) =>
    client.post<Expense>('/expenses/', data),

  delete: (id: number) =>
    client.delete<{ message: string }>(`/expenses/${id}`),

  categorize: (text: string) =>
    client.post<{
      amount: number | null
      category: string | null
      merchant: string | null
      description: string | null
    }>('/ai/categorize', { text }),
}