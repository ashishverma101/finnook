import { client } from './client'

export interface PredictionItem {
  category: string
  predicted_amount: number
  current_month_actual: number
  data_points: number
}

export interface PredictionResponse {
  predictions: PredictionItem[]
  total_predicted: number
  next_month: string
  message: string
}

export const predictionsApi = {
  getNextMonth: () => client.get<PredictionResponse>('/predictions/next-month'),
}