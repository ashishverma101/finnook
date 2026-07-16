import { Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import { expensesApi } from '../api/expenses'
import { Expense, ExpenseCreate } from '../types'

const CATEGORIES = ['Food', 'Shopping', 'Rent', 'Travel', 'Entertainment', 'Bills', 'Healthcare', 'Other']
const PAYMENT_METHODS = ['UPI', 'Cash', 'Credit Card', 'Debit Card', 'Net Banking']

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [aiText, setAiText] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const [form, setForm] = useState<ExpenseCreate>({
    amount: 0,
    category: 'Food',
    merchant: '',
    payment_method: 'UPI',
    date: new Date().toISOString().split('T')[0],
    description: ''
  })

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const data = await expensesApi.getAll()
      setExpenses(data)
    } catch (err) {
      setError('Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }

  const handleAICategorize = async () => {
    if (!aiText.trim()) return
    setAiLoading(true)
    try {
      const result = await expensesApi.categorize(aiText)
      setForm(prev => ({
        ...prev,
        amount: result.amount ?? prev.amount,
        category: result.category ?? prev.category,
        merchant: result.merchant ?? prev.merchant,
        description: result.description ?? prev.description,
      }))
      setShowForm(true)
      setAiText('')
    } catch {
      setError('AI categorization failed')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const newExpense = await expensesApi.create(form)
      setExpenses([newExpense, ...expenses])
      setShowForm(false)
      setForm({
        amount: 0,
        category: 'Food',
        merchant: '',
        payment_method: 'UPI',
        date: new Date().toISOString().split('T')[0],
        description: ''
      })
    } catch (err) {
      setError('Failed to add expense')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await expensesApi.delete(id)
      setExpenses(expenses.filter(e => e.id !== id))
    } catch (err) {
      setError('Failed to delete expense')
    }
  }

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)

  const categoryColors: Record<string, string> = {
    Food: 'bg-orange-100 text-orange-700',
    Shopping: 'bg-purple-100 text-purple-700',
    Rent: 'bg-red-100 text-red-700',
    Travel: 'bg-blue-100 text-blue-700',
    Entertainment: 'bg-pink-100 text-pink-700',
    Bills: 'bg-yellow-100 text-yellow-700',
    Healthcare: 'bg-green-100 text-green-700',
    Other: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#021526]">Expenses</h1>
          <p className="text-[#021526]/60 mt-1">
            Total spent: <span className="font-semibold text-[#03346E]">₹{totalSpent.toLocaleString()}</span>
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#03346E] hover:bg-[#021526] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Expense'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* AI Input Box */}
      <div className="glass-card rounded-xl p-5 mb-4">
        <p className="text-sm font-medium text-[#021526] mb-2 flex items-center gap-2">
          <Sparkles size={15} className="text-[#03346E]" />
          Describe your expense in plain text
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={aiText}
            onChange={e => setAiText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAICategorize()}
            placeholder="e.g. Paid 550 to Swiggy for lunch"
            className="flex-1 bg-[#DAE2B6]/30 border border-[#6EACDA]/40 rounded-lg px-4 py-2.5 text-[#021526] placeholder-[#021526]/30 focus:outline-none focus:border-[#03346E] text-sm"
          />
          <button
            onClick={handleAICategorize}
            disabled={aiLoading || !aiText.trim()}
            className="bg-[#03346E] hover:bg-[#021526] disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            {aiLoading ? 'Thinking...' : (
              <span className="flex items-center gap-1.5">
                <Sparkles size={13} />
                Auto-fill
              </span>
            )}
          </button>
        </div>
        <p className="text-xs text-[#021526]/40 mt-2">
          AI will auto-fill the form below — you can review and edit before saving
        </p>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <div className="glass-card rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#021526] mb-4">Add New Expense</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#021526]/70 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={form.amount || ''}
                  onChange={e => setForm({ ...form, amount: Number(e.target.value) })}
                  className="w-full bg-[#DAE2B6]/30 border border-[#6EACDA]/40 rounded-lg px-4 py-2.5 text-[#021526] focus:outline-none focus:border-[#03346E]"
                  placeholder="250"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#021526]/70 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-[#DAE2B6]/30 border border-[#6EACDA]/40 rounded-lg px-4 py-2.5 text-[#021526] focus:outline-none focus:border-[#03346E]"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#021526]/70 mb-1">Merchant</label>
                <input
                  type="text"
                  value={form.merchant}
                  onChange={e => setForm({ ...form, merchant: e.target.value })}
                  className="w-full bg-[#DAE2B6]/30 border border-[#6EACDA]/40 rounded-lg px-4 py-2.5 text-[#021526] focus:outline-none focus:border-[#03346E]"
                  placeholder="Swiggy, Amazon..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#021526]/70 mb-1">Payment Method</label>
                <select
                  value={form.payment_method}
                  onChange={e => setForm({ ...form, payment_method: e.target.value })}
                  className="w-full bg-[#DAE2B6]/30 border border-[#6EACDA]/40 rounded-lg px-4 py-2.5 text-[#021526] focus:outline-none focus:border-[#03346E]"
                >
                  {PAYMENT_METHODS.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#021526]/70 mb-1">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-[#DAE2B6]/30 border border-[#6EACDA]/40 rounded-lg px-4 py-2.5 text-[#021526] focus:outline-none focus:border-[#03346E]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#021526]/70 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-[#DAE2B6]/30 border border-[#6EACDA]/40 rounded-lg px-4 py-2.5 text-[#021526] focus:outline-none focus:border-[#03346E]"
                  placeholder="Optional note..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-[#03346E] hover:bg-[#021526] disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {submitting ? 'Adding...' : 'Add Expense'}
            </button>
          </form>
        </div>
      )}

      {/* Expenses List */}
      <div className="glass-card rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#021526]/50">Loading expenses...</div>
        ) : expenses.length === 0 ? (
          <div className="p-8 text-center text-[#021526]/50">
            No expenses yet. Add your first one above!
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#6EACDA]/20">
                <th className="text-left px-6 py-4 text-sm font-medium text-[#021526]/60">Date</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#021526]/60">Merchant</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#021526]/60">Category</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#021526]/60">Payment</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-[#021526]/60">Amount</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-[#021526]/60">Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, index) => (
                <tr
                  key={expense.id}
                  className={`border-b border-[#6EACDA]/10 hover:bg-[#DAE2B6]/20 transition-colors ${
                    index === expenses.length - 1 ? 'border-0' : ''
                  }`}
                >
                  <td className="px-6 py-4 text-sm text-[#021526]/70">{expense.date}</td>
                  <td className="px-6 py-4 text-sm font-medium text-[#021526]">
                    {expense.merchant || '—'}
                    {expense.description && (
                      <p className="text-xs text-[#021526]/40 mt-0.5">{expense.description}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryColors[expense.category] || categoryColors['Other']}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#021526]/70">{expense.payment_method || '—'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#021526] text-right">
                    ₹{expense.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}