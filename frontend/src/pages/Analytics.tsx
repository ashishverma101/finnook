import { useState, useEffect } from 'react'
import { expensesApi } from '../api/expenses'
import { Expense } from '../types'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart,
  Line, Legend
} from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#f97316',
  Shopping: '#a855f7',
  Rent: '#ef4444',
  Travel: '#3b82f6',
  Entertainment: '#ec4899',
  Bills: '#eab308',
  Healthcare: '#22c55e',
  Other: '#6b7280',
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function Analytics() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    expensesApi.getAll()
      .then(setExpenses)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <p className="text-[#021526]/50">Loading analytics...</p>
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#021526] mb-2">Analytics</h1>
        <div className="bg-white border border-[#6EACDA]/30 rounded-xl p-12 text-center shadow-sm">
          <TrendingUp size={40} className="text-[#6EACDA] mx-auto mb-3" />
          <p className="text-[#021526] font-medium">No data yet</p>
          <p className="text-[#021526]/50 text-sm mt-1">Add some expenses to see your analytics</p>
        </div>
      </div>
    )
  }

  // --- Data processing ---

  // 1. Category breakdown
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {} as Record<string, number>)

  const total = Object.values(byCategory).reduce((a, b) => a + b, 0)

  const categoryData = Object.entries(byCategory)
    .map(([name, value]) => ({
      name,
      value,
      percent: ((value / total) * 100).toFixed(1)
    }))
    .sort((a, b) => b.value - a.value)

  // 2. Monthly trend
  const byMonth = expenses.reduce((acc, e) => {
    const date = new Date(e.date)
    const key = `${date.getFullYear()}-${date.getMonth()}`
    const label = `${MONTHS[date.getMonth()]} ${date.getFullYear()}`
    if (!acc[key]) acc[key] = { label, amount: 0, sort: date.getFullYear() * 12 + date.getMonth() }
    acc[key].amount += e.amount
    return acc
  }, {} as Record<string, { label: string; amount: number; sort: number }>)

  const monthlyData = Object.values(byMonth)
    .sort((a, b) => a.sort - b.sort)
    .map(({ label, amount }) => ({ label, amount }))

  // 3. Day of week pattern
  const byDay = Array(7).fill(0)
  expenses.forEach(e => {
    const day = new Date(e.date).getDay()
    byDay[day] += e.amount
  })
  const dayData = DAYS.map((day, i) => ({ day, amount: byDay[i] }))

  // 4. Top merchants
  const byMerchant = expenses.reduce((acc, e) => {
    const key = e.merchant || e.category
    acc[key] = (acc[key] || 0) + e.amount
    return acc
  }, {} as Record<string, number>)

  const topMerchants = Object.entries(byMerchant)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // 5. Average per transaction
  const avgTransaction = total / expenses.length

  // 6. This month vs last month
  const now = new Date()
  const thisMonth = expenses.filter(e => {
    const d = new Date(e.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const lastMonth = expenses.filter(e => {
    const d = new Date(e.date)
    const lm = new Date(now.getFullYear(), now.getMonth() - 1)
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear()
  })

  const thisMonthTotal = thisMonth.reduce((s, e) => s + e.amount, 0)
  const lastMonthTotal = lastMonth.reduce((s, e) => s + e.amount, 0)
  const monthChange = lastMonthTotal > 0
    ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(1)
    : null

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#021526]">Analytics</h1>
        <p className="text-[#021526]/60 mt-1">Deep dive into your spending patterns</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#6EACDA]/30 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-[#021526]/50 mb-1">Total Transactions</p>
          <p className="text-2xl font-bold text-[#021526]">{expenses.length}</p>
        </div>
        <div className="bg-white border border-[#6EACDA]/30 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-[#021526]/50 mb-1">Avg per Transaction</p>
          <p className="text-2xl font-bold text-[#021526]">₹{avgTransaction.toFixed(0)}</p>
        </div>
        <div className="bg-white border border-[#6EACDA]/30 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-[#021526]/50 mb-1">This Month</p>
          <p className="text-2xl font-bold text-[#021526]">₹{thisMonthTotal.toLocaleString()}</p>
          {monthChange !== null && (
            <p className={`text-xs mt-1 flex items-center gap-0.5 ${
              Number(monthChange) > 0 ? 'text-red-500' : 'text-green-600'
            }`}>
              {Number(monthChange) > 0
                ? <TrendingUp size={11} />
                : Number(monthChange) < 0
                ? <TrendingDown size={11} />
                : <Minus size={11} />
              }
              {monthChange}% vs last month
            </p>
          )}
        </div>
        <div className="bg-white border border-[#6EACDA]/30 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-[#021526]/50 mb-1">Categories Used</p>
          <p className="text-2xl font-bold text-[#021526]">{categoryData.length}</p>
        </div>
      </div>

      {/* Monthly trend + Day pattern */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Monthly trend */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="font-semibold text-[#021526] mb-4">Monthly Spending Trend</h2>
          {monthlyData.length < 2 ? (
            <p className="text-sm text-[#021526]/40 text-center py-8">
              Add expenses across multiple months to see trends
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#6EACDA20" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#02152660' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#02152660' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `₹${v}`}
                />
                <Tooltip
                  formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Spent']}
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #6EACDA40',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#03346E"
                  strokeWidth={2}
                  dot={{ fill: '#03346E', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Day of week pattern */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="font-semibold text-[#021526] mb-4">Spending by Day of Week</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#6EACDA20" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#02152660' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#02152660' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `₹${v}`}
              />
              <Tooltip
                formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Spent']}
                contentStyle={{
                  background: 'white',
                  border: '1px solid #6EACDA40',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="amount" fill="#6EACDA" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Category breakdown + Top merchants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Category pie + list */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="font-semibold text-[#021526] mb-4">Category Breakdown</h2>
          <div className="flex gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map(entry => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Amount']}
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #6EACDA40',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {categoryData.map(cat => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: CATEGORY_COLORS[cat.name] || '#6b7280' }}
                    />
                    <span className="text-xs text-[#021526]/70">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-[#021526]">
                      {cat.percent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top merchants */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="font-semibold text-[#021526] mb-4">Top Merchants</h2>
          <div className="space-y-3">
            {topMerchants.map(([name, amount], index) => (
              <div key={name}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#021526]/40 w-4">{index + 1}</span>
                    <span className="text-sm text-[#021526]">{name}</span>
                  </div>
                  <span className="text-sm font-medium text-[#021526]">
                    ₹{amount.toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 bg-[#DAE2B6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#03346E] rounded-full"
                    style={{ width: `${(amount / topMerchants[0][1]) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Full expense history */}
      <div className="bg-white border border-[#6EACDA]/30 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#6EACDA]/20">
          <h2 className="font-semibold text-[#021526]">Full Spending History</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#6EACDA]/10">
              <th className="text-left px-6 py-3 text-xs font-medium text-[#021526]/50">Date</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[#021526]/50">Merchant</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[#021526]/50">Category</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-[#021526]/50">Amount</th>
            </tr>
          </thead>
          <tbody>
            {[...expenses]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map(expense => (
                <tr
                  key={expense.id}
                  className="border-b border-[#6EACDA]/10 hover:bg-[#DAE2B6]/20 last:border-0"
                >
                  <td className="px-6 py-3 text-sm text-[#021526]/60">{expense.date}</td>
                  <td className="px-6 py-3 text-sm text-[#021526]">
                    {expense.merchant || '—'}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: `${CATEGORY_COLORS[expense.category]}20`,
                        color: CATEGORY_COLORS[expense.category] || '#6b7280'
                      }}
                    >
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm font-semibold text-[#021526] text-right">
                    ₹{expense.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}