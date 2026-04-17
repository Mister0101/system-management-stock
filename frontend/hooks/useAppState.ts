import { useState, useEffect, type FormEvent } from 'react'
import type { AppState, Category, ExpenseCategory, InventoryItem } from '../types'
import { categories, seedState } from '../data/data'

const API = 'http://localhost:5213/api'

type View = 'overview' | 'inventory' | 'deliveries' | 'expenses'
export type CategoryFilter = Category | 'All'

interface DeliveryDraft {
  itemId: string
  supplier: string
  quantity: string
  unitCost: string
  eta: string
}

interface ExpenseDraft {
  name: string
  amount: string
  category: ExpenseCategory
  dueLabel: string
}

export function useAppState() {
  const [view, setView] = useState<View>('overview')
  const [appState, setAppState] = useState<AppState>(structuredClone(seedState))
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All')
  const [stockDrafts, setStockDrafts] = useState<Record<string, string>>({})
  const [deliveryDraft, setDeliveryDraft] = useState<DeliveryDraft>({
    itemId: seedState.inventory[0].id,
    supplier: 'Harbor Beverage Co.',
    quantity: '60',
    unitCost: '0.75',
    eta: 'Tomorrow, 11:00',
  })
  const [expenseDraft, setExpenseDraft] = useState<ExpenseDraft>({
    name: '',
    amount: '0',
    category: 'Supplies',
    dueLabel: 'Today',
  })

  // Load all data from the API on mount
  useEffect(() => {
    Promise.all([
      fetch(`${API}/inventory`).then((r) => r.json()),
      fetch(`${API}/deliveries`).then((r) => r.json()),
      fetch(`${API}/expenses`).then((r) => r.json()),
    ]).then(([inventory, deliveries, expenses]) => {
      setAppState((prev) => ({ ...prev, inventory, deliveries, expenses }))
      setLoading(false)
    }).catch(() => {
      // API unreachable — fall back to seed data
      setLoading(false)
    })
  }, [])

  // ── Computed ───────────────────────────────────────────────────
  const grossSales = appState.inventory.reduce(
    (total, item) => total + item.dailySold * item.sellPrice,
    0,
  )
  const unitsSold = appState.inventory.reduce((total, item) => total + item.dailySold, 0)
  const operatingCosts = appState.expenses.reduce((total, e) => total + e.amount, 0)
  const pendingDeliveryCost = appState.deliveries
    .filter((d) => d.status !== 'Received')
    .reduce((total, d) => total + d.quantity * d.unitCost, 0)
  const inventoryValue = appState.inventory.reduce(
    (total, item) => total + item.inStock * item.costPrice,
    0,
  )
  const projectedNet = grossSales - operatingCosts - pendingDeliveryCost
  const lowStockItems = appState.inventory.filter((item) => item.inStock <= item.parLevel)

  const categorySummary = categories.map((category) => {
    const items = appState.inventory.filter((item) => item.category === category)
    return {
      category,
      count: items.length,
      revenue: items.reduce((total, item) => total + item.dailySold * item.sellPrice, 0),
      stockUnits: items.reduce((total, item) => total + item.inStock, 0),
    }
  })

  const visibleInventory = appState.inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // ── Actions ────────────────────────────────────────────────────
  function mergeInventoryItem(updated: InventoryItem) {
    setAppState((current) => ({
      ...current,
      inventory: current.inventory.map((item) => (item.id === updated.id ? updated : item)),
    }))
  }

  async function updateStock(itemId: string, nextStock: number) {
    const updated = await fetch(`${API}/inventory/${itemId}/stock`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextStock),
    }).then((r) => r.json())
    mergeInventoryItem(updated)
  }

  async function restockItem(itemId: string, amount: number) {
    const updated = await fetch(`${API}/inventory/${itemId}/restock`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(amount),
    }).then((r) => r.json())
    mergeInventoryItem(updated)
  }

  async function recordSale(itemId: string, amount: number) {
    const updated = await fetch(`${API}/inventory/${itemId}/sale`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(amount),
    }).then((r) => r.json())
    mergeInventoryItem(updated)
  }

  async function receiveDelivery(deliveryId: string) {
    const result = await fetch(`${API}/deliveries/${deliveryId}/receive`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
    }).then((r) => r.json())
    // API returns { delivery, item } — update both in one state write
    setAppState((current) => ({
      ...current,
      inventory: current.inventory.map((i) =>
        i.id === result.item?.id ? result.item : i,
      ),
      deliveries: current.deliveries.map((d) =>
        d.id === result.delivery.id ? result.delivery : d,
      ),
    }))
  }

  async function addDelivery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const matchedItem = appState.inventory.find((item) => item.id === deliveryDraft.itemId)
    if (!matchedItem) return
    const payload = {
      supplier: deliveryDraft.supplier.trim() || matchedItem.supplier,
      eta: deliveryDraft.eta.trim() || 'TBD',
      itemId: matchedItem.id,
      itemName: matchedItem.name,
      quantity: Number(deliveryDraft.quantity) || 0,
      unitCost: Number(deliveryDraft.unitCost) || matchedItem.costPrice,
    }
    const created = await fetch(`${API}/deliveries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((r) => r.json())
    setAppState((current) => ({
      ...current,
      deliveries: [created, ...current.deliveries],
    }))
    setDeliveryDraft((current) => ({
      ...current,
      quantity: '60',
      unitCost: String(matchedItem.costPrice),
      eta: 'Tomorrow, 11:00',
    }))
  }

  async function addExpense(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = expenseDraft.name.trim()
    if (!trimmedName) return
    const payload = {
      name: trimmedName,
      amount: Number(expenseDraft.amount) || 0,
      category: expenseDraft.category,
      dueLabel: expenseDraft.dueLabel.trim() || 'Today',
      recurring: false,
    }
    const created = await fetch(`${API}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((r) => r.json())
    setAppState((current) => ({
      ...current,
      expenses: [created, ...current.expenses],
    }))
    setExpenseDraft({ name: '', amount: '0', category: 'Supplies', dueLabel: 'Today' })
  }

  function resetDemoData() {
    setAppState(structuredClone(seedState))
    setStockDrafts({})
  }

  return {
    // Navigation
    loading,
    view,
    setView,
    // Overview
    weeklyData: appState.weeklyData,
    grossSales,
    unitsSold,
    operatingCosts,
    pendingDeliveryCost,
    inventoryValue,
    projectedNet,
    expenseCount: appState.expenses.length,
    pendingDeliveryCount: appState.deliveries.filter((d) => d.status !== 'Received').length,
    inventoryCount: appState.inventory.length,
    categorySummary,
    lowStockItems,
    recentDeliveries: appState.deliveries.slice(0, 4),
    inventory: appState.inventory,
    // Inventory view
    visibleInventory,
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    stockDrafts,
    onStockDraftChange: (id: string, value: string) =>
      setStockDrafts((current) => ({ ...current, [id]: value })),
    onRecordSale: recordSale,
    onRestock: restockItem,
    onUpdateStock: updateStock,
    // Delivery view
    deliveries: appState.deliveries,
    inventoryItems: appState.inventory,
    deliveryDraft,
    onDeliveryDraftChange: setDeliveryDraft,
    onReceiveDelivery: receiveDelivery,
    onAddDelivery: addDelivery,
    // Expense view
    expenses: appState.expenses,
    expenseDraft,
    onExpenseDraftChange: setExpenseDraft,
    onAddExpense: addExpense,
    // Global
    resetDemoData,
  }
}
