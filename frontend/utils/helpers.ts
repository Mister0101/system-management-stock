import type { DeliveryStatus } from '../types'

export function getStatusTone(status: DeliveryStatus): 'success' | 'warning' | 'neutral' {
  if (status === 'Received') return 'success'
  if (status === 'En Route') return 'warning'
  return 'neutral'
}
