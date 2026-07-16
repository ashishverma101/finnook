import { client } from './client'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export const chatApi = {
  sendMessage: (message: string) =>
    client.post<{ reply: string }>('/ai/chat', { message }),
}