import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartColumn } from 'lucide-react'
import { formatMoney } from '../utils/formatters'

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dishes': '#f05a2a',
  Spirits: '#7c3aed',
  Wines: '#c2185b',
  'Beers & Ciders': '#f59e0b',
  'Soft Drinks': '#0891b2',
  'Cocktail Mixers': '#059669',
  'Hot Beverages': '#92400e',
  'Dairy & Fresh': '#0284c7',
  'Dry Goods': '#6b7280',
  'Cleaning & Hygiene': '#10b981',
  Packaging: '#8b5cf6',
}

interface CategoryDataPoint {
  name: string
  revenue: number
}

interface RevenueCategoryChartProps {
  data: CategoryDataPoint[]
}

export function RevenueCategoryChart({ data }: RevenueCategoryChartProps) {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3>Revenue by Category</h3>
          <p>Today's sales per product group</p>
        </div>
        <ChartColumn size={18} className="chart-icon" />
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#70808d' }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#70808d' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            formatter={(val: unknown) => [formatMoney(Number(val)), 'Revenue']}
            contentStyle={{ borderRadius: 12, border: '1px solid #ddd4c9', fontSize: 13 }}
          />
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={CATEGORY_COLORS[entry.name.replace('\n', ' ')] ?? '#f05a2a'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
