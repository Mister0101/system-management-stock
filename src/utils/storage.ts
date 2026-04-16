import type { AppState } from '../types'
import { seedState } from '../data/data'

export const storageKey = 'system-management-stock-state-v2'

export function loadState(): AppState {
  const stored = localStorage.getItem(storageKey)
  if (!stored) return structuredClone(seedState)
  try {
    const parsed = JSON.parse(stored) as AppState
    if (!parsed.weeklyData) return structuredClone(seedState)
    return parsed
  } catch {
    return structuredClone(seedState)
  }
}
