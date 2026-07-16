import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'
import { Expense } from '../types'

interface Props {
  expenses: Expense[]
}

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

export default function SpendingCharts({ expenses }: Props) {

  const categoryData = Object.entries(
    expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount
      return acc
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }))

  const dailyData = Object.entries(
    expenses.reduce((acc, e) => {
      const day = e.date.slice(5)
      acc[day] = (acc[day] || 0) + e.amount
      return acc
    }, {} as Record<string, number>)
  )
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date))

  if (expenses.length === 0) {
    return (
      <div className="glass-card rounded-xl p-8 text-center text-[#021526]/40 text-sm">
        Add some expenses to see your spending charts
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* Pie Chart */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="font-semibold text-[#021526] mb-4">Spending by Category</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {categoryData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={CATEGORY_COLORS[entry.name] || '#6b7280'}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
              contentStyle={{
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid #6EACDA40',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-2 mt-2">
          {categoryData.map(entry => (
            <div key={entry.name} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: CATEGORY_COLORS[entry.name] || '#6b7280' }}
              />
              <span className="text-xs text-[#021526]/60">{entry.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="font-semibold text-[#021526] mb-4">Daily Spending</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#6EACDA20" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#02152660' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#02152660' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip
              formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Spent']}
              contentStyle={{
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid #6EACDA40',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="amount" fill="#03346E" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}