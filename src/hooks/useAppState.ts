import { useState, useEffect, type FormEvent } from 'react'
import type { AppState, Category, ExpenseCategory } from '../types'
import { categories, seedState } from '../data/data'
import { storageKey, loadState } from '../utils/storage'

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
  const [appState, setAppState] = useState<AppState>(loadState)
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

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(appState))
  }, [appState])

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
        if (item.id !== itemId) return item
        const soldUnits = Math.min(amount, item.inStock)
        return { ...item, inStock: item.inStock - soldUnits, dailySold: item.dailySold + soldUnits }
      }),
    }))
  }

  function receiveDelivery(deliveryId: string) {
    const delivery = appState.deliveries.find((entry) => entry.id === deliveryId)
    if (!delivery || delivery.status === 'Received') return
    setAppState((current) => ({
      ...current,
      inventory: current.inventory.map((item) =>
        item.id === delivery.itemId
          ? { ...item, inStock: item.inStock + delivery.quantity, lastDelivery: 'Just now' }
          : item,
      ),
      deliveries: current.deliveries.map((entry) =>
        entry.id === deliveryId ? { ...entry, status: 'Received' } : entry,
      ),
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
    setExpenseDraft({ name: '', amount: '0', category: 'Supplies', dueLabel: 'Today' })
  }

  function resetDemoData() {
    setAppState(structuredClone(seedState))
    setStockDrafts({})
  }

  return {
    // Navigation
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
