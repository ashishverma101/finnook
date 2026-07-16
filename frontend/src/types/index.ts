export interface User {
  id: number
  name: string
  email: string
}

export interface Expense {
  id: number
  amount: number
  category: string
  merchant?: string
  payment_method?: string
  date: string
  description?: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  salary?: number
  monthly_budget?: number
}

export interface ExpenseCreate {
  amount: number
  category: string
  merchant?: string
  payment_method?: string
  date: string
  description?: string
}