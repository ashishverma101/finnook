import { useState, useEffect } from 'react'
import { predictionsApi, PredictionItem, PredictionResponse } from '../api/predictions'
import { TrendingUp, AlertCircle, Info } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'

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

export default function Predictions() {
  const [data, setData] = useState<PredictionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    predictionsApi.getNextMonth()
      .then(setData)
      .catch(() => setError('Failed to load predictions'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <p className="text-[#021526]/50">Calculating predictions...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="glass-card rounded-xl p-4 flex gap-3">
          <AlertCircle size={18} className="text-red-500 mt-0.5" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (!data || data.predictions.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#021526] mb-2">Predictions</h1>
        <div className="glass-card rounded-xl p-8 text-center">
          <TrendingUp size={40} className="text-[#6EACDA] mx-auto mb-3" />
          <p className="text-[#021526] font-medium">Not enough data yet</p>
          <p className="text-[#021526]/50 text-sm mt-1">
            Add expenses across multiple months to see spending predictions
          </p>
        </div>
      </div>
    )
  }

  const chartData = data.predictions.map(p => ({
    category: p.category,
    predicted: p.predicted_amount,
    actual: p.current_month_actual,
  }))

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#021526] mb-1">Predictions</h1>
        <p className="text-[#021526]/60">
          Forecast for <span className="font-medium text-[#03346E]">{data.next_month}</span>
          {' '}based on your spending history
        </p>
      </div>

      {/* Total Prediction Card */}
      <div className="bg-[#03346E] rounded-xl p-6 text-white shadow-sm">
        <p className="text-white/70 text-sm">Total Predicted Spending</p>
        <p className="text-4xl font-bold mt-1">₹{data.total_predicted.toLocaleString()}</p>
        <p className="text-white/60 text-sm mt-2 flex items-center gap-1.5">
          <Info size={13} />
          {data.message}
        </p>
      </div>

      {/* Chart */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="font-semibold text-[#021526] mb-4">
          Predicted vs Current Month
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#6EACDA20" />
            <XAxis
              dataKey="category"
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
              formatter={(value: number, name: string) => [
                `₹${value.toLocaleString()}`,
                name === 'predicted' ? 'Predicted' : 'Current Month'
              ]}
              contentStyle={{
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid #6EACDA40',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="actual" fill="#6EACDA" radius={[4, 4, 0, 0]} name="actual" />
            <Bar dataKey="predicted" radius={[4, 4, 0, 0]} name="predicted">
              {chartData.map((entry) => (
                <Cell
                  key={entry.category}
                  fill={CATEGORY_COLORS[entry.category] || '#6b7280'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#6EACDA]" />
            <span className="text-xs text-[#021526]/50">Current Month</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-[#03346E]" />
            <span className="text-xs text-[#021526]/50">Predicted Next Month</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#6EACDA]/20">
          <h2 className="font-semibold text-[#021526]">Category Breakdown</h2>
        </div>
        <div className="divide-y divide-[#6EACDA]/10">
          {data.predictions.map((item: PredictionItem) => {
            const diff = item.predicted_amount - item.current_month_actual
            const isUp = diff > 0

            return (
              <div key={item.category} className="px-6 py-4 flex items-center justify-between hover:bg-[#DAE2B6]/20">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: CATEGORY_COLORS[item.category] || '#6b7280' }}
                  />
                  <div>
                    <p className="text-sm font-medium text-[#021526]">{item.category}</p>
                    <p className="text-xs text-[#021526]/40 mt-0.5">
                      This month: ₹{item.current_month_actual.toLocaleString()}
                      {' · '}{item.data_points} month{item.data_points !== 1 ? 's' : ''} of data
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#021526]">
                    ₹{item.predicted_amount.toLocaleString()}
                  </p>
                  {item.current_month_actual > 0 && (
                    <p className={`text-xs mt-0.5 flex items-center justify-end gap-0.5 ${isUp ? 'text-red-500' : 'text-green-600'}`}>
                      <TrendingUp size={10} className={isUp ? '' : 'rotate-180'} />
                      {isUp ? '+' : ''}₹{Math.abs(diff).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}