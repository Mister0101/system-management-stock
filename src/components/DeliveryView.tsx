import type { FormEvent } from 'react'
import type { Delivery, InventoryItem } from '../types'
import { formatMoney } from '../utils/formatters'
import { getStatusTone } from '../utils/helpers'
import { PanelHeader } from './PanelHeader'

interface DeliveryDraft {
  itemId: string
  supplier: string
  quantity: string
  unitCost: string
  eta: string
}

interface DeliveryViewProps {
  deliveries: Delivery[]
  inventoryItems: InventoryItem[]
  draft: DeliveryDraft
  onDraftChange: (draft: DeliveryDraft) => void
  onReceive: (id: string) => void
  onAdd: (e: FormEvent<HTMLFormElement>) => void
}

export function DeliveryView({
  deliveries,
  inventoryItems,
  draft,
  onDraftChange,
  onReceive,
  onAdd,
}: DeliveryViewProps) {
  return (
    <div className="content-grid two-column-layout">
      <section className="panel">
        <PanelHeader
          title="Scheduled deliveries"
          subtitle="Receive incoming stock into inventory"
        />
        <div className="list-stack">
          {deliveries.map((delivery) => (
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
                  onClick={() => onReceive(delivery.id)}
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
        <form className="editor-form" onSubmit={onAdd}>
          <label>
            Item
            <select
              value={draft.itemId}
              onChange={(e) => onDraftChange({ ...draft, itemId: e.target.value })}
            >
              {inventoryItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Supplier
            <input
              value={draft.supplier}
              onChange={(e) => onDraftChange({ ...draft, supplier: e.target.value })}
            />
          </label>
          <div className="form-split">
            <label>
              Quantity
              <input
                inputMode="numeric"
                value={draft.quantity}
                onChange={(e) => onDraftChange({ ...draft, quantity: e.target.value })}
              />
            </label>
            <label>
              Unit cost
              <input
                inputMode="decimal"
                value={draft.unitCost}
                onChange={(e) => onDraftChange({ ...draft, unitCost: e.target.value })}
              />
            </label>
          </div>
          <label>
            ETA
            <input
              value={draft.eta}
              onChange={(e) => onDraftChange({ ...draft, eta: e.target.value })}
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
