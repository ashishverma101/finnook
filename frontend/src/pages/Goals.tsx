import { useState, useEffect } from 'react'
import { goalsApi, Goal, GoalCreate } from '../api/goals'
import { Target, Plus, Trash2, PiggyBank } from 'lucide-react'

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState<GoalCreate>({
    goal_name: '',
    target_amount: 0,
    deadline: ''
  })

  useEffect(() => {
    goalsApi.getAll()
      .then(setGoals)
      .catch(() => setError('Failed to load goals'))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const newGoal = await goalsApi.create(form)
      setGoals([...goals, newGoal])
      setShowForm(false)
      setForm({ goal_name: '', target_amount: 0, deadline: '' })
    } catch {
      setError('Failed to create goal')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await goalsApi.delete(id)
      setGoals(goals.filter(g => g.id !== id))
    } catch {
      setError('Failed to delete goal')
    }
  }

  const handleAddSavings = async (goal: Goal, amount: number) => {
    try {
      const updated = await goalsApi.updateSaved(
        goal.id,
        Math.min(goal.saved_amount + amount, goal.target_amount)
      )
      setGoals(goals.map(g => g.id === goal.id ? updated : g))
    } catch {
      setError('Failed to update savings')
    }
  }

  const getMonthsLeft = (deadline: string) => {
    const now = new Date()
    const end = new Date(deadline)
    const months = (end.getFullYear() - now.getFullYear()) * 12 +
      (end.getMonth() - now.getMonth())
    return Math.max(0, months)
  }

  const getMonthlySavingsNeeded = (goal: Goal) => {
    const months = getMonthsLeft(goal.deadline)
    if (months === 0) return 0
    return Math.ceil((goal.target_amount - goal.saved_amount) / months)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#021526]">Goals</h1>
          <p className="text-[#021526]/60 mt-1">Track your savings targets</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#03346E] hover:bg-[#021526] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Goal
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Add Goal Form */}
      {showForm && (
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[#021526] mb-4">New Goal</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#021526]/70 mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={form.goal_name}
                  onChange={e => setForm({ ...form, goal_name: e.target.value })}
                  className="w-full bg-[#DAE2B6]/30 border border-[#6EACDA]/40 rounded-lg px-4 py-2.5 text-[#021526] focus:outline-none focus:border-[#03346E]"
                  placeholder="MacBook Pro"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#021526]/70 mb-1">
                  Target Amount (₹)
                </label>
                <input
                  type="number"
                  value={form.target_amount || ''}
                  onChange={e => setForm({ ...form, target_amount: Number(e.target.value) })}
                  className="w-full bg-[#DAE2B6]/30 border border-[#6EACDA]/40 rounded-lg px-4 py-2.5 text-[#021526] focus:outline-none focus:border-[#03346E]"
                  placeholder="120000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#021526]/70 mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                  className="w-full bg-[#DAE2B6]/30 border border-[#6EACDA]/40 rounded-lg px-4 py-2.5 text-[#021526] focus:outline-none focus:border-[#03346E]"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#03346E] hover:bg-[#021526] disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {submitting ? 'Creating...' : 'Create Goal'}
            </button>
          </form>
        </div>
      )}

      {/* Goals Grid */}
      {loading ? (
        <div className="text-center text-[#021526]/50 py-12">Loading goals...</div>
      ) : goals.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <Target size={40} className="text-[#6EACDA] mx-auto mb-3" />
          <p className="text-[#021526] font-medium">No goals yet</p>
          <p className="text-[#021526]/50 text-sm mt-1">
            Set a savings goal to start tracking your progress
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => {
            const progress = Math.min((goal.saved_amount / goal.target_amount) * 100, 100)
            const monthsLeft = getMonthsLeft(goal.deadline)
            const monthlySavings = getMonthlySavingsNeeded(goal)
            const isComplete = goal.saved_amount >= goal.target_amount

            return (
              <div key={goal.id} className="glass-card rounded-xl p-6">
                {/* Goal header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#DAE2B6] rounded-lg flex items-center justify-center">
                      <PiggyBank size={20} className="text-[#03346E]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#021526]">{goal.goal_name}</h3>
                      <p className="text-xs text-[#021526]/50 mt-0.5">
                        Due {goal.deadline} · {monthsLeft} months left
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="text-[#021526]/30 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-[#021526]/60">
                      ₹{goal.saved_amount.toLocaleString()} saved
                    </span>
                    <span className="font-medium text-[#021526]">
                      ₹{goal.target_amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2.5 bg-[#DAE2B6] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isComplete ? 'bg-green-500' : 'bg-[#03346E]'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-[#021526]/40">{progress.toFixed(1)}% complete</span>
                    {!isComplete && monthlySavings > 0 && (
                      <span className="text-xs text-[#03346E] font-medium">
                        Save ₹{monthlySavings.toLocaleString()}/month
                      </span>
                    )}
                    {isComplete && (
                      <span className="text-xs text-green-600 font-medium">🎉 Goal reached!</span>
                    )}
                  </div>
                </div>

                {/* Add savings input */}
                {!isComplete && (
                  <div className="flex gap-2 mt-4">
                    <input
                      type="number"
                      placeholder="Add ₹ to savings"
                      className="flex-1 bg-[#DAE2B6]/30 border border-[#6EACDA]/40 rounded-lg px-3 py-2 text-sm text-[#021526] focus:outline-none focus:border-[#03346E]"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          const val = Number((e.target as HTMLInputElement).value)
                          if (val > 0) {
                            handleAddSavings(goal, val);
                            (e.target as HTMLInputElement).value = ''
                          }
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = (e.currentTarget.previousSibling as HTMLInputElement)
                        const val = Number(input.value)
                        if (val > 0) {
                          handleAddSavings(goal, val)
                          input.value = ''
                        }
                      }}
                      className="bg-[#03346E] hover:bg-[#021526] text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}