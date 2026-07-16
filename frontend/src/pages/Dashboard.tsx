import { TrendingDown, TrendingUp, Pencil, Check, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { expensesApi } from '../api/expenses'
import { authApi } from '../api/auth'
import { Expense } from '../types'
import SpendingCharts from '../components/SpendingCharts'

export default function Dashboard() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [monthlyBudget, setMonthlyBudget] = useState(0)
  const [editingBudget, setEditingBudget] = useState(false)
  const [budgetInput, setBudgetInput] = useState('')
  const [savingBudget, setSavingBudget] = useState(false)

  useEffect(() => {
    expensesApi.getAll().then(setExpenses).catch(() => {})
    authApi.getMe().then(data => {
      setMonthlyBudget(data.monthly_budget || 40000)
    }).catch(() => {})
  }, [])

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
  const remaining = monthlyBudget - totalSpent

  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {} as Record<string, number>)

  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]

  const handleBudgetSave = async () => {
    const newBudget = Number(budgetInput)
    if (!newBudget || newBudget <= 0) return
    setSavingBudget(true)
    try {
      await authApi.updateProfile({ monthly_budget: newBudget })
      setMonthlyBudget(newBudget)
      setEditingBudget(false)
    } catch {
      // fail silently
    } finally {
      setSavingBudget(false)
    }
  }

  const handleBudgetKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleBudgetSave()
    if (e.key === 'Escape') setEditingBudget(false)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#021526] mb-1">
          Welcome back, {user?.name} 👋
        </h1>
        <p className="text-[#021526]/60">Here's your financial overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-5">
          <p className="text-[#021526]/60 text-sm">Total Spent</p>
          <p className="text-2xl font-bold text-[#021526] mt-1">
            ₹{totalSpent.toLocaleString()}
          </p>
          <p className="text-xs text-[#021526]/40 mt-1">{expenses.length} transactions</p>
        </div>

        {/* Budget card with inline edit */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-[#021526]/60 text-sm">Monthly Budget</p>
            {!editingBudget && (
              <button
                onClick={() => {
                  setBudgetInput(String(monthlyBudget))
                  setEditingBudget(true)
                }}
                className="text-[#021526]/30 hover:text-[#03346E] transition-colors"
              >
                <Pencil size={13} />
              </button>
            )}
          </div>

          {editingBudget ? (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-[#021526]">₹</span>
                <input
                  type="number"
                  value={budgetInput}
                  onChange={e => setBudgetInput(e.target.value)}
                  onKeyDown={handleBudgetKeyDown}
                  autoFocus
                  className="flex-1 bg-[#DAE2B6]/40 border border-[#03346E]/40 rounded-lg px-3 py-1.5 text-[#021526] text-lg font-bold focus:outline-none focus:border-[#03346E] w-full"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleBudgetSave}
                  disabled={savingBudget}
                  className="flex items-center gap-1 bg-[#03346E] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-[#021526]"
                >
                  <Check size={12} />
                  {savingBudget ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setEditingBudget(false)}
                  className="flex items-center gap-1 text-[#021526]/50 hover:text-[#021526] px-3 py-1.5 rounded-lg text-xs border border-[#6EACDA]/30 transition-colors"
                >
                  <X size={12} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold text-[#021526] mt-1">
                ₹{monthlyBudget.toLocaleString()}
              </p>
              <div className="mt-2 h-1.5 bg-[#DAE2B6] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#03346E] rounded-full transition-all"
                  style={{ width: `${Math.min((totalSpent / monthlyBudget) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-[#021526]/40 mt-1">
                {monthlyBudget > 0 ? ((totalSpent / monthlyBudget) * 100).toFixed(1) : 0}% used
              </p>
            </>
          )}
        </div>

        <div className="glass-card rounded-xl p-5">
          <p className="text-[#021526]/60 text-sm">Remaining</p>
          <p className={`text-2xl font-bold mt-1 ${remaining >= 0 ? 'text-[#03346E]' : 'text-red-500'}`}>
            ₹{remaining.toLocaleString()}
          </p>
          <p className="text-xs text-[#021526]/40 mt-1 flex items-center gap-1">
            {remaining >= 0
              ? <><TrendingUp size={11} className="text-[#03346E]" /> On track</>
              : <><TrendingDown size={11} className="text-red-500" /> Over budget</>
            }
          </p>
        </div>
      </div>

      {/* Charts */}
      <SpendingCharts expenses={expenses} />

      {/* Recent Expenses */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#6EACDA]/20 flex justify-between items-center">
          <h2 className="font-semibold text-[#021526]">Recent Expenses</h2>
          {topCategory && (
            <span className="text-xs text-[#021526]/50">
              Top: <span className="font-medium text-[#03346E]">{topCategory[0]}</span> — ₹{topCategory[1].toLocaleString()}
            </span>
          )}
        </div>
        {expenses.length === 0 ? (
          <div className="p-8 text-center text-[#021526]/40 text-sm">
            No expenses yet — go to Expenses to add your first one!
          </div>
        ) : (
          <div className="divide-y divide-[#6EACDA]/10">
            {expenses.slice(0, 5).map(expense => (
              <div key={expense.id} className="px-6 py-3 flex justify-between items-center hover:bg-[#DAE2B6]/20">
                <div>
                  <p className="text-sm font-medium text-[#021526]">
                    {expense.merchant || expense.category}
                  </p>
                  <p className="text-xs text-[#021526]/40">
                    {expense.date} · {expense.category}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[#021526]">
                  ₹{expense.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}