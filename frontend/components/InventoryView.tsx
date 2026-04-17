import { Search } from 'lucide-react'
import type { Category, InventoryItem } from '../types'
import { categories } from '../data/data'
import { formatMoney, formatUnits } from '../utils/formatters'
import { PanelHeader } from './PanelHeader'

type CategoryFilter = Category | 'All'

interface InventoryViewProps {
  inventory: InventoryItem[]
  searchTerm: string
  onSearchChange: (term: string) => void
  categoryFilter: CategoryFilter
  onCategoryChange: (cat: CategoryFilter) => void
  stockDrafts: Record<string, string>
  onStockDraftChange: (id: string, value: string) => void
  onRecordSale: (id: string, amount: number) => void
  onRestock: (id: string, amount: number) => void
  onUpdateStock: (id: string, next: number) => void
}

export function InventoryView({
  inventory,
  searchTerm,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  stockDrafts,
  onStockDraftChange,
  onRecordSale,
  onRestock,
  onUpdateStock,
}: InventoryViewProps) {
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
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search items"
              type="search"
            />
          </label>
          <div className="filter-group">
            {(['All', ...categories] as CategoryFilter[]).map((cat) => (
              <button
                key={cat}
                className={categoryFilter === cat ? 'filter-pill active' : 'filter-pill'}
                onClick={() => onCategoryChange(cat)}
                type="button"
              >
                {cat}
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
          {inventory.map((item) => {
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
                    <button onClick={() => onRecordSale(item.id, 1)} type="button">
                      Sell 1
                    </button>
                    <button onClick={() => onRecordSale(item.id, 5)} type="button">
                      Sell 5
                    </button>
                    <button onClick={() => onRestock(item.id, 10)} type="button">
                      Restock 10
                    </button>
                  </div>
                  <div className="inline-form">
                    <input
                      aria-label={`Set stock for ${item.name}`}
                      inputMode="numeric"
                      value={stockDraft}
                      onChange={(e) => onStockDraftChange(item.id, e.target.value)}
                    />
                    <button
                      onClick={() => onUpdateStock(item.id, Number(stockDraft) || 0)}
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
