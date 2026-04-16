import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  AlertTriangle,
  BanknoteArrowDown,
  Bell,
  Boxes,
  ChartColumn,
  CircleDollarSign,
  LayoutGrid,
  Package,
  Search,
  ShieldCheck,
  ShoppingBasket,
  TrendingUp,
  Truck,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './App.css'
import { categories, expenseCategories, seedState } from './data'
import type {
  AppState,
  Category,
  DeliveryStatus,
  ExpenseCategory,
  InventoryItem,
} from './types'

type View = 'overview' | 'inventory' | 'deliveries' | 'expenses'
type CategoryFilter = Category | 'All'

const storageKey = 'system-management-stock-state-v2'

const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

const integerFormatter = new Intl.NumberFormat('en-US')

function formatMoney(value: number) {
  return moneyFormatter.format(value)
}

function formatUnits(value: number) {
  return integerFormatter.format(value)
}

function loadState(): AppState {
  const stored = localStorage.getItem(storageKey)

  if (!stored) {
    return structuredClone(seedState)
  }

  try {
    const parsed = JSON.parse(stored) as AppState
    if (!parsed.weeklyData) return structuredClone(seedState)
    return parsed
  } catch {
    return structuredClone(seedState)
  }
}

function getStatusTone(status: DeliveryStatus) {
  if (status === 'Received') return 'success'
  if (status === 'En Route') return 'warning'
  return 'neutral'
}

function App() {
  const [view, setView] = useState<View>('overview')
  const [appState, setAppState] = useState<AppState>(loadState)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All')
  const [stockDrafts, setStockDrafts] = useState<Record<string, string>>({})
  const [deliveryDraft, setDeliveryDraft] = useState({
    itemId: seedState.inventory[0].id,
    supplier: 'Harbor Beverage Co.',
    quantity: '60',
    unitCost: '0.75',
    eta: 'Tomorrow, 11:00',
  })
  const [expenseDraft, setExpenseDraft] = useState({
    name: '',
    amount: '0',
    category: 'Supplies' as ExpenseCategory,
    dueLabel: 'Today',
  })

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(appState))
  }, [appState])

  const grossSales = appState.inventory.reduce(
    (total, item) => total + item.dailySold * item.sellPrice,
    0,
  )
  const unitsSold = appState.inventory.reduce((total, item) => total + item.dailySold, 0)
  const operatingCosts = appState.expenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  )
  const pendingDeliveryCost = appState.deliveries
    .filter((delivery) => delivery.status !== 'Received')
    .reduce((total, delivery) => total + delivery.quantity * delivery.unitCost, 0)
  const inventoryValue = appState.inventory.reduce(
    (total, item) => total + item.inStock * item.costPrice,
    0,
  )
  const projectedNet = grossSales - operatingCosts - pendingDeliveryCost

  const lowStockItems = appState.inventory.filter((item) => item.inStock <= item.parLevel)

  const categorySummary = categories.map((category) => {
    const items = appState.inventory.filter((item) => item.category === category)
    const revenue = items.reduce((total, item) => total + item.dailySold * item.sellPrice, 0)
    const stockUnits = items.reduce((total, item) => total + item.inStock, 0)

    return {
      category,
      count: items.length,
      revenue,
      stockUnits,
    }
  })

  const visibleInventory = appState.inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  function updateStock(itemId: string, nextStock: number) {
    setAppState((current) => ({
      ...current,
      inventory: current.inventory.map((item) =>
        item.id === itemId ? { ...item, inStock: Math.max(0, nextStock) } : item,
      ),
    }))
  }

  function restockItem(itemId: string, amount: number) {
    const item = appState.inventory.find((entry) => entry.id === itemId)
    if (!item) return

    updateStock(itemId, item.inStock + amount)
  }

  function recordSale(itemId: string, amount: number) {
    setAppState((current) => ({
      ...current,
      inventory: current.inventory.map((item) => {
        if (item.id !== itemId) {
          return item
        }

        const soldUnits = Math.min(amount, item.inStock)

        return {
          ...item,
          inStock: item.inStock - soldUnits,
          dailySold: item.dailySold + soldUnits,
        }
      }),
    }))
  }

  function receiveDelivery(deliveryId: string) {
    const delivery = appState.deliveries.find((entry) => entry.id === deliveryId)
    if (!delivery || delivery.status === 'Received') {
      return
    }

    setAppState((current) => ({
      inventory: current.inventory.map((item) =>
        item.id === delivery.itemId
          ? {
              ...item,
              inStock: item.inStock + delivery.quantity,
              lastDelivery: 'Just now',
            }
          : item,
      ),
      deliveries: current.deliveries.map((entry) =>
        entry.id === deliveryId ? { ...entry, status: 'Received' } : entry,
      ),
      expenses: current.expenses,
      weeklyData: current.weeklyData,
    }))
  }

  function addDelivery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const matchedItem = appState.inventory.find((item) => item.id === deliveryDraft.itemId)
    if (!matchedItem) return

    setAppState((current) => ({
      ...current,
      deliveries: [
        {
          id: crypto.randomUUID(),
          supplier: deliveryDraft.supplier.trim() || matchedItem.supplier,
          eta: deliveryDraft.eta.trim() || 'TBD',
          itemId: matchedItem.id,
          itemName: matchedItem.name,
          quantity: Number(deliveryDraft.quantity) || 0,
          unitCost: Number(deliveryDraft.unitCost) || matchedItem.costPrice,
          status: 'Scheduled',
        },
        ...current.deliveries,
      ],
    }))

    setDeliveryDraft((current) => ({
      ...current,
      quantity: '60',
      unitCost: String(matchedItem.costPrice),
      eta: 'Tomorrow, 11:00',
    }))
  }

  function addExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = expenseDraft.name.trim()
    if (!trimmedName) return

    setAppState((current) => ({
      ...current,
      expenses: [
        {
          id: crypto.randomUUID(),
          name: trimmedName,
          amount: Number(expenseDraft.amount) || 0,
          category: expenseDraft.category,
          dueLabel: expenseDraft.dueLabel.trim() || 'Today',
          recurring: false,
        },
        ...current.expenses,
      ],
    }))

    setExpenseDraft({
      name: '',
      amount: '0',
      category: 'Supplies',
      dueLabel: 'Today',
    })
  }

  function resetDemoData() {
    setAppState(structuredClone(seedState))
    setStockDrafts({})
  }

  function renderOverview() {
    // Category revenue data for bar chart — only categories with sales
    const catChartData = categorySummary
      .filter((s) => s.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .map((s) => ({ name: s.category.replace(' & ', ' &\n'), revenue: s.revenue }))

    // Top 6 sellers for horizontal bar chart
    const topSix = [...appState.inventory]
      .filter((i) => i.dailySold > 0)
      .sort((a, b) => b.dailySold * b.sellPrice - a.dailySold * a.sellPrice)
      .slice(0, 6)

    const topSixData = topSix.map((i) => ({
      name: i.name.length > 18 ? i.name.slice(0, 16) + '…' : i.name,
      revenue: parseFloat((i.dailySold * i.sellPrice).toFixed(2)),
    }))

    const categoryColors: Record<string, string> = {
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

    const lowStock = appState.inventory
      .filter((i) => i.inStock <= i.parLevel)
      .slice(0, 6)

    const recentDeliveries = appState.deliveries.slice(0, 4)

    return (
      <div className="ov-grid">
        {/* ── KPI row ─────────────────────────────────────── */}
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
            sub={`${appState.expenses.length} expenses`}
            tone="neutral"
          />
          <KpiCard
            icon={<Truck size={16} />}
            label="Pending Deliveries"
            value={formatMoney(pendingDeliveryCost)}
            sub={`${appState.deliveries.filter((d) => d.status !== 'Received').length} orders`}
            tone="amber"
          />
          <KpiCard
            icon={<Package size={16} />}
            label="Inventory Value"
            value={formatMoney(inventoryValue)}
            sub={`${appState.inventory.length} SKUs tracked`}
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

        {/* ── Charts row ──────────────────────────────────── */}
        <div className="charts-row">
          {/* Weekly revenue trend */}
          <div className="chart-card stretch">
            <div className="chart-header">
              <div>
                <h3>Weekly Revenue Trend</h3>
                <p>Revenue vs. operating costs Mon – Sun</p>
              </div>
              <TrendingUp size={18} className="chart-icon" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={appState.weeklyData} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#70808d' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#70808d' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(val: unknown, name: unknown) => [formatMoney(Number(val)), (name as string) === 'revenue' ? 'Revenue' : 'Costs']}                  
                  contentStyle={{ borderRadius: 12, border: '1px solid #ddd4c9', fontSize: 13 }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#f05a2a" strokeWidth={2.5} dot={{ r: 4, fill: '#f05a2a' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="costs" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category revenue */}
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <h3>Revenue by Category</h3>
                <p>Today's sales per product group</p>
              </div>
              <ChartColumn size={18} className="chart-icon" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={catChartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#70808d' }} axisLine={false} tickLine={false} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#70808d' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(val: unknown) => [formatMoney(Number(val)), 'Revenue']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #ddd4c9', fontSize: 13 }}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                  {catChartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={categoryColors[entry.name.replace('\n', ' ')] ?? '#f05a2a'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Bottom row ──────────────────────────────────── */}
        <div className="bottom-row">
          {/* Top items by revenue */}
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <h3>Top Sellers</h3>
                <p>Revenue generated today</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={topSixData} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#70808d' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#1d2731' }} axisLine={false} tickLine={false} width={110} />
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
              {lowStock.map((item) => {
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

  function renderInventory() {
    return (
      <div className="content-grid">
        <section className="panel toolbar-panel">
          <PanelHeader
            title="Inventory operations"
            subtitle="Search items, record sales, restock stock, or set exact counts"
          />
          <div className="toolbar-row">
            <label className="search-box">
              <Search size={16} />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search items"
                type="search"
              />
            </label>
            <div className="filter-group">
              {(['All', ...categories] as CategoryFilter[]).map((category) => (
                <button
                  key={category}
                  className={categoryFilter === category ? 'filter-pill active' : 'filter-pill'}
                  onClick={() => setCategoryFilter(category)}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="panel table-panel">
          <div className="inventory-table">
            <div className="inventory-head">
              <span>Item</span>
              <span>Stock</span>
              <span>Sales</span>
              <span>Actions</span>
            </div>
            {visibleInventory.map((item: InventoryItem) => {
              const stockDraft = stockDrafts[item.id] ?? String(item.inStock)

              return (
                <article key={item.id} className="inventory-row">
                  <div>
                    <strong>{item.name}</strong>
                    <span>
                      {item.category} • {item.location} • last delivery {item.lastDelivery}
                    </span>
                  </div>
                  <div className="inventory-stock">
                    <strong>{formatUnits(item.inStock)}</strong>
                    <span>
                      par {formatUnits(item.parLevel)} {item.unit}
                    </span>
                  </div>
                  <div className="inventory-sales">
                    <strong>{formatUnits(item.dailySold)}</strong>
                    <span>{formatMoney(item.dailySold * item.sellPrice)}</span>
                  </div>
                  <div className="row-actions">
                    <div className="button-row">
                      <button onClick={() => recordSale(item.id, 1)} type="button">
                        Sell 1
                      </button>
                      <button onClick={() => recordSale(item.id, 5)} type="button">
                        Sell 5
                      </button>
                      <button onClick={() => restockItem(item.id, 10)} type="button">
                        Restock 10
                      </button>
                    </div>
                    <div className="inline-form">
                      <input
                        aria-label={`Set stock for ${item.name}`}
                        inputMode="numeric"
                        value={stockDraft}
                        onChange={(event) =>
                          setStockDrafts((current) => ({
                            ...current,
                            [item.id]: event.target.value,
                          }))
                        }
                      />
                      <button
                        onClick={() => updateStock(item.id, Number(stockDraft) || 0)}
                        type="button"
                      >
                        Set stock
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </div>
    )
  }

  function renderDeliveries() {
    return (
      <div className="content-grid two-column-layout">
        <section className="panel">
          <PanelHeader title="Scheduled deliveries" subtitle="Receive incoming stock into inventory" />
          <div className="list-stack">
            {appState.deliveries.map((delivery) => (
              <article key={delivery.id} className="delivery-card">
                <div>
                  <strong>{delivery.itemName}</strong>
                  <span>
                    {delivery.supplier} • {delivery.quantity} units • {delivery.eta}
                  </span>
                </div>
                <div className="delivery-actions">
                  <span className={`status-pill ${getStatusTone(delivery.status)}`}>
                    {delivery.status}
                  </span>
                  <strong>{formatMoney(delivery.quantity * delivery.unitCost)}</strong>
                  <button
                    disabled={delivery.status === 'Received'}
                    onClick={() => receiveDelivery(delivery.id)}
                    type="button"
                  >
                    Receive delivery
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <PanelHeader title="Create delivery" subtitle="Add a future stock order using dummy data" />
          <form className="editor-form" onSubmit={addDelivery}>
            <label>
              Item
              <select
                value={deliveryDraft.itemId}
                onChange={(event) =>
                  setDeliveryDraft((current) => ({ ...current, itemId: event.target.value }))
                }
              >
                {appState.inventory.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Supplier
              <input
                value={deliveryDraft.supplier}
                onChange={(event) =>
                  setDeliveryDraft((current) => ({ ...current, supplier: event.target.value }))
                }
              />
            </label>
            <div className="form-split">
              <label>
                Quantity
                <input
                  inputMode="numeric"
                  value={deliveryDraft.quantity}
                  onChange={(event) =>
                    setDeliveryDraft((current) => ({ ...current, quantity: event.target.value }))
                  }
                />
              </label>
              <label>
                Unit cost
                <input
                  inputMode="decimal"
                  value={deliveryDraft.unitCost}
                  onChange={(event) =>
                    setDeliveryDraft((current) => ({ ...current, unitCost: event.target.value }))
                  }
                />
              </label>
            </div>
            <label>
              ETA
              <input
                value={deliveryDraft.eta}
                onChange={(event) =>
                  setDeliveryDraft((current) => ({ ...current, eta: event.target.value }))
                }
              />
            </label>
            <button className="primary-button" type="submit">
              Schedule delivery
            </button>
          </form>
        </section>
      </div>
    )
  }

  function renderExpenses() {
    return (
      <div className="content-grid two-column-layout">
        <section className="panel">
          <PanelHeader title="Expense register" subtitle="Daily costs that reduce projected profit" />
          <div className="list-stack">
            {appState.expenses.map((expense) => (
              <article key={expense.id} className="list-row">
                <div>
                  <strong>{expense.name}</strong>
                  <span>
                    {expense.category} • {expense.dueLabel}
                  </span>
                </div>
                <div className="list-metric">
                  <strong>{formatMoney(expense.amount)}</strong>
                  <span>{expense.recurring ? 'recurring' : 'one-off'}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <PanelHeader title="Add expense" subtitle="Model rent, utilities, delivery charges, or ad hoc spend" />
          <form className="editor-form" onSubmit={addExpense}>
            <label>
              Expense name
              <input
                value={expenseDraft.name}
                onChange={(event) =>
                  setExpenseDraft((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Example: Emergency glassware restock"
              />
            </label>
            <div className="form-split">
              <label>
                Category
                <select
                  value={expenseDraft.category}
                  onChange={(event) =>
                    setExpenseDraft((current) => ({
                      ...current,
                      category: event.target.value as ExpenseCategory,
                    }))
                  }
                >
                  {expenseCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Amount
                <input
                  inputMode="decimal"
                  value={expenseDraft.amount}
                  onChange={(event) =>
                    setExpenseDraft((current) => ({ ...current, amount: event.target.value }))
                  }
                />
              </label>
            </div>
            <label>
              Due label
              <input
                value={expenseDraft.dueLabel}
                onChange={(event) =>
                  setExpenseDraft((current) => ({ ...current, dueLabel: event.target.value }))
                }
              />
            </label>
            <button className="primary-button" type="submit">
              Add expense
            </button>
          </form>
        </section>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">SM</div>
          <div>
            <strong>System Management Stock</strong>
            <span>Bar operations demo</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Primary navigation">
          <button
            className={view === 'overview' ? 'nav-item active' : 'nav-item'}
            onClick={() => setView('overview')}
            type="button"
          >
            <LayoutGrid size={18} />
            Overview
          </button>
          <button
            className={view === 'inventory' ? 'nav-item active' : 'nav-item'}
            onClick={() => setView('inventory')}
            type="button"
          >
            <Boxes size={18} />
            Inventory
          </button>
          <button
            className={view === 'deliveries' ? 'nav-item active' : 'nav-item'}
            onClick={() => setView('deliveries')}
            type="button"
          >
            <Truck size={18} />
            Deliveries
          </button>
          <button
            className={view === 'expenses' ? 'nav-item active' : 'nav-item'}
            onClick={() => setView('expenses')}
            type="button"
          >
            <ShoppingBasket size={18} />
            Expenses
          </button>
        </nav>

        <div className="sidebar-card">
          <span>Future backend</span>
          <strong>.NET API ready later</strong>
          <p>
            This frontend already separates stock, deliveries, and expenses into structured state for
            an API integration phase.
          </p>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">Operations center</span>
            <h2>Daily stock and sales control</h2>
          </div>
          <div className="topbar-actions">
            <div className="chip muted-chip">
              <ShieldCheck size={16} />
              Dummy data mode
            </div>
            <button className="icon-button" type="button">
              <Bell size={18} />
            </button>
            <button className="primary-button" onClick={resetDemoData} type="button">
              Reset demo data
            </button>
          </div>
        </header>

        {view === 'overview' && renderOverview()}
        {view === 'inventory' && renderInventory()}
        {view === 'deliveries' && renderDeliveries()}
        {view === 'expenses' && renderExpenses()}
      </main>
    </div>
  )
}

type KpiCardProps = {
  icon: ReactNode
  label: string
  value: string
  sub: string
  tone: 'green' | 'red' | 'amber' | 'neutral'
}

function KpiCard({ icon, label, value, sub, tone }: KpiCardProps) {
  return (
    <div className={`kpi-card kpi-${tone}`}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-body">
        <span className="kpi-label">{label}</span>
        <strong className="kpi-value">{value}</strong>
        <span className="kpi-sub" dangerouslySetInnerHTML={{ __html: sub }} />
      </div>
    </div>
  )
}

type PanelHeaderProps = {
  title: string
  subtitle: string
}

function PanelHeader({ title, subtitle }: PanelHeaderProps) {
  return (
    <div className="panel-header">
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </div>
  )
}

export default App
