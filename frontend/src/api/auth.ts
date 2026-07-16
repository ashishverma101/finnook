import { client } from './client'
import { AuthResponse, LoginRequest, RegisterRequest } from '../types'

export const authApi = {
  login: (data: LoginRequest) =>
    client.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) =>
    client.post<AuthResponse>('/auth/register', data),

  updateProfile: (data: { monthly_budget?: number; salary?: number }) =>
    client.patch<{ message: string; monthly_budget: number; salary: number }>(
      '/auth/profile', data
    ),

  getMe: () =>
    client.get<{ id: number; name: string; email: string; salary: number; monthly_budget: number }>(
      '/auth/me'
    ),
}