import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import type { WeeklyDataPoint } from '../types'
import { formatMoney } from '../utils/formatters'

interface WeeklyTrendChartProps {
  data: WeeklyDataPoint[]
}

export function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  return (
    <div className="chart-card stretch">
      <div className="chart-header">
        <div>
          <h3>Weekly Revenue Trend</h3>
          <p>Revenue vs. operating costs Mon – Sun</p>
        </div>
        <TrendingUp size={18} className="chart-icon" />
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12, fill: '#70808d' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#70808d' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            formatter={(val: unknown, name: unknown) => [
              formatMoney(Number(val)),
              (name as string) === 'revenue' ? 'Revenue' : 'Costs',
            ]}
            contentStyle={{ borderRadius: 12, border: '1px solid #ddd4c9', fontSize: 13 }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#f05a2a"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#f05a2a' }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="costs"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="4 3"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
