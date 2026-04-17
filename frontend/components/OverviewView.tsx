import {
  AlertTriangle,
  BanknoteArrowDown,
  ChartColumn,
  CircleDollarSign,
  Package,
  Truck,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Category, Delivery, InventoryItem, WeeklyDataPoint } from '../types'
import { formatMoney, formatUnits } from '../utils/formatters'
import { getStatusTone } from '../utils/helpers'
import { KpiCard } from './KpiCard'
import { WeeklyTrendChart } from './WeeklyTrendChart'
import { RevenueCategoryChart } from './RevenueCategoryChart'

interface CategorySummary {
  category: Category
  revenue: number
  stockUnits: number
  count: number
}

interface OverviewViewProps {
  weeklyData: WeeklyDataPoint[]
  grossSales: number
  unitsSold: number
  operatingCosts: number
  pendingDeliveryCost: number
  inventoryValue: number
  projectedNet: number
  expenseCount: number
  pendingDeliveryCount: number
  inventoryCount: number
  categorySummary: CategorySummary[]
  lowStockItems: InventoryItem[]
  recentDeliveries: Delivery[]
  inventory: InventoryItem[]
}

export function OverviewView({
  weeklyData,
  grossSales,
  unitsSold,
  operatingCosts,
  pendingDeliveryCost,
  inventoryValue,
  projectedNet,
  expenseCount,
  pendingDeliveryCount,
  inventoryCount,
  categorySummary,
  lowStockItems,
  recentDeliveries,
  inventory,
}: OverviewViewProps) {
  const catChartData = categorySummary
    .filter((s) => s.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .map((s) => ({ name: s.category.replace(' & ', ' &\n'), revenue: s.revenue }))

  const topSixData = [...inventory]
    .filter((i) => i.dailySold > 0)
    .sort((a, b) => b.dailySold * b.sellPrice - a.dailySold * a.sellPrice)
    .slice(0, 6)
    .map((i) => ({
      name: i.name.length > 18 ? i.name.slice(0, 16) + '…' : i.name,
      revenue: parseFloat((i.dailySold * i.sellPrice).toFixed(2)),
    }))

  return (
    <div className="ov-grid">
      {/* ── KPI row ──────────────────────────────────────────── */}
      <div className="kpi-row">
        <KpiCard
          icon={<CircleDollarSign size={16} />}
          label="Gross Sales Today"
          value={formatMoney(grossSales)}
          sub={`${formatUnits(unitsSold)} units`}
          tone="green"
        />
        <KpiCard
          icon={<ChartColumn size={16} />}
          label="Projected Net"
          value={formatMoney(projectedNet)}
          sub="after costs &amp; deliveries"
          tone={projectedNet >= 0 ? 'green' : 'red'}
        />
        <KpiCard
          icon={<BanknoteArrowDown size={16} />}
          label="Operating Costs"
          value={formatMoney(operatingCosts)}
          sub={`${expenseCount} expenses`}
          tone="neutral"
        />
        <KpiCard
          icon={<Truck size={16} />}
          label="Pending Deliveries"
          value={formatMoney(pendingDeliveryCost)}
          sub={`${pendingDeliveryCount} orders`}
          tone="amber"
        />
        <KpiCard
          icon={<Package size={16} />}
          label="Inventory Value"
          value={formatMoney(inventoryValue)}
          sub={`${inventoryCount} SKUs tracked`}
          tone="neutral"
        />
        <KpiCard
          icon={<AlertTriangle size={16} />}
          label="Low Stock Alerts"
          value={String(lowStockItems.length)}
          sub="items at or below par"
          tone={lowStockItems.length > 4 ? 'red' : 'amber'}
        />
      </div>

      {/* ── Charts row ───────────────────────────────────────── */}
      <div className="charts-row">
        <WeeklyTrendChart data={weeklyData} />
        <RevenueCategoryChart data={catChartData} />
      </div>

      {/* ── Bottom row ───────────────────────────────────────── */}
      <div className="bottom-row">
        {/* Top sellers */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <h3>Top Sellers</h3>
              <p>Revenue generated today</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart
              data={topSixData}
              layout="vertical"
              margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(0,0,0,0.06)"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#70808d' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: '#1d2731' }}
                axisLine={false}
                tickLine={false}
                width={110}
              />
              <Tooltip
                formatter={(val: unknown) => [formatMoney(Number(val)), 'Revenue']}
                contentStyle={{ borderRadius: 12, border: '1px solid #ddd4c9', fontSize: 13 }}
              />
              <Bar dataKey="revenue" fill="#f05a2a" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Low stock alerts */}
        <div className="info-card">
          <div className="chart-header">
            <div>
              <h3>Low Stock Alerts</h3>
              <p>Items at or below par level</p>
            </div>
            <AlertTriangle size={16} className="chart-icon warn" />
          </div>
          <div className="compact-list">
            {lowStockItems.slice(0, 6).map((item) => {
              const pct = Math.round((item.inStock / item.parLevel) * 100)
              return (
                <div key={item.id} className="compact-row">
                  <div className="compact-meta">
                    <strong>{item.name}</strong>
                    <span>{item.category}</span>
                  </div>
                  <div className="compact-right">
                    <strong className={pct <= 50 ? 'danger-text' : 'warn-text'}>
                      {formatUnits(item.inStock)}
                    </strong>
                    <div className="stock-bar-wrap">
                      <div className="stock-bar-bg">
                        <div
                          className="stock-bar-fill"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            background: pct <= 50 ? '#ef4444' : '#f59e0b',
                          }}
                        />
                      </div>
                      <span>{pct}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Incoming deliveries */}
        <div className="info-card">
          <div className="chart-header">
            <div>
              <h3>Incoming Deliveries</h3>
              <p>Scheduled and en route</p>
            </div>
            <Truck size={16} className="chart-icon" />
          </div>
          <div className="compact-list">
            {recentDeliveries.map((delivery) => (
              <div key={delivery.id} className="compact-row">
                <div className="compact-meta">
                  <strong>{delivery.itemName}</strong>
                  <span>{delivery.supplier}</span>
                </div>
                <div className="compact-right align-right">
                  <strong>{formatMoney(delivery.quantity * delivery.unitCost)}</strong>
                  <span className={`status-pill ${getStatusTone(delivery.status)}`}>
                    {delivery.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
