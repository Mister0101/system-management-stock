export type Category =
  | 'Food & Dishes'
  | 'Spirits'
  | 'Wines'
  | 'Beers & Ciders'
  | 'Soft Drinks'
  | 'Cocktail Mixers'
  | 'Hot Beverages'
  | 'Dairy & Fresh'
  | 'Dry Goods'
  | 'Cleaning & Hygiene'
  | 'Packaging'

export type InventoryItem = {
  id: string
  name: string
  category: Category
  unit: string
  location: string
  supplier: string
  sellPrice: number
  costPrice: number
  inStock: number
  parLevel: number
  dailySold: number
  lastDelivery: string
}

export type DeliveryStatus = 'Scheduled' | 'En Route' | 'Received'

export type Delivery = {
  id: string
  supplier: string
  eta: string
  itemId: string
  itemName: string
  quantity: number
  unitCost: number
  status: DeliveryStatus
}

export type ExpenseCategory =
  | 'Rent'
  | 'Utilities'
  | 'Supplies'
  | 'Payroll'
  | 'Maintenance'
  | 'Marketing'

export type Expense = {
  id: string
  name: string
  category: ExpenseCategory
  amount: number
  dueLabel: string
  recurring: boolean
}

export type WeeklyDataPoint = {
  day: string
  revenue: number
  costs: number
}

export type AppState = {
  inventory: InventoryItem[]
  deliveries: Delivery[]
  expenses: Expense[]
  weeklyData: WeeklyDataPoint[]
}