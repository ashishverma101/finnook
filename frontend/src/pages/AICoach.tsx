import { useState, useEffect, useRef } from 'react'
import { chatApi, ChatMessage } from '../api/chat'
import { Send, Bot, User, Sparkles } from 'lucide-react'

const SUGGESTED_QUESTIONS = [
  "Where am I wasting money?",
  "How can I save more this month?",
  "What's my biggest spending category?",
  "Am I on track with my budget?",
  "Give me 3 tips to reduce my expenses",
]

export default function AICoach() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI financial coach. I have access to your spending data and can give you personalized advice. What would you like to know?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await chatApi.sendMessage(text)
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.reply,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I couldn't process that. Please try again.",
        timestamp: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#DAE2B6]">
      {/* Header */}
      <div className="bg-white border-b border-[#6EACDA]/30 px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 bg-[#03346E] rounded-lg flex items-center justify-center">
          <Bot size={18} className="text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-[#021526]">AI Financial Coach</h1>
          <p className="text-xs text-[#021526]/50">Powered by your spending data</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-6 py-4 space-y-4">

        {/* Suggested questions — only show when just the welcome message */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {SUGGESTED_QUESTIONS.map(q => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="bg-white border border-[#6EACDA]/40 hover:border-[#03346E] hover:bg-[#03346E]/5 text-[#021526]/70 hover:text-[#03346E] text-xs px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Sparkles size={11} />
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              msg.role === 'assistant'
                ? 'bg-[#03346E]'
                : 'bg-[#6EACDA]'
            }`}>
              {msg.role === 'assistant'
                ? <Bot size={15} className="text-white" />
                : <User size={15} className="text-white" />
              }
            </div>

            {/* Bubble */}
            <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'assistant'
                ? 'bg-white border border-[#6EACDA]/30 text-[#021526] rounded-tl-sm'
                : 'bg-[#03346E] text-white rounded-tr-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#03346E] flex items-center justify-center flex-shrink-0">
              <Bot size={15} className="text-white" />
            </div>
            <div className="bg-white border border-[#6EACDA]/30 px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1 items-center h-4">
                <div className="w-1.5 h-1.5 bg-[#03346E]/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-[#03346E]/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-[#03346E]/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-[#6EACDA]/30 px-6 py-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Ask anything about your finances..."
            className="flex-1 bg-[#DAE2B6]/30 border border-[#6EACDA]/40 rounded-xl px-4 py-3 text-sm text-[#021526] placeholder-[#021526]/30 focus:outline-none focus:border-[#03346E]"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="bg-[#03346E] hover:bg-[#021526] disabled:opacity-40 text-white p-3 rounded-xl transition-colors"
          >
            <Send size={17} />
          </button>
        </div>
      </div>
    </div>
  )
}