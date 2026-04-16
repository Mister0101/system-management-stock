import { Bell, Boxes, LayoutGrid, ShieldCheck, ShoppingBasket, Truck } from 'lucide-react'
import { useAppState } from './hooks/useAppState'
import { OverviewView } from './components/OverviewView'
import { InventoryView } from './components/InventoryView'
import { DeliveryView } from './components/DeliveryView'
import { ExpensesView } from './components/ExpensesView'

function App() {
  const state = useAppState()

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
            className={state.view === 'overview' ? 'nav-item active' : 'nav-item'}
            onClick={() => state.setView('overview')}
            type="button"
          >
            <LayoutGrid size={18} />
            Overview
          </button>
          <button
            className={state.view === 'inventory' ? 'nav-item active' : 'nav-item'}
            onClick={() => state.setView('inventory')}
            type="button"
          >
            <Boxes size={18} />
            Inventory
          </button>
          <button
            className={state.view === 'deliveries' ? 'nav-item active' : 'nav-item'}
            onClick={() => state.setView('deliveries')}
            type="button"
          >
            <Truck size={18} />
            Deliveries
          </button>
          <button
            className={state.view === 'expenses' ? 'nav-item active' : 'nav-item'}
            onClick={() => state.setView('expenses')}
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
            This frontend already separates stock, deliveries, and expenses into structured state
            for an API integration phase.
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
            <button className="primary-button" onClick={state.resetDemoData} type="button">
              Reset demo data
            </button>
          </div>
        </header>

        {state.view === 'overview' && (
          <OverviewView
            weeklyData={state.weeklyData}
            grossSales={state.grossSales}
            unitsSold={state.unitsSold}
            operatingCosts={state.operatingCosts}
            pendingDeliveryCost={state.pendingDeliveryCost}
            inventoryValue={state.inventoryValue}
            projectedNet={state.projectedNet}
            expenseCount={state.expenseCount}
            pendingDeliveryCount={state.pendingDeliveryCount}
            inventoryCount={state.inventoryCount}
            categorySummary={state.categorySummary}
            lowStockItems={state.lowStockItems}
            recentDeliveries={state.recentDeliveries}
            inventory={state.inventory}
          />
        )}

        {state.view === 'inventory' && (
          <InventoryView
            inventory={state.visibleInventory}
            searchTerm={state.searchTerm}
            onSearchChange={state.setSearchTerm}
            categoryFilter={state.categoryFilter}
            onCategoryChange={state.setCategoryFilter}
            stockDrafts={state.stockDrafts}
            onStockDraftChange={state.onStockDraftChange}
            onRecordSale={state.onRecordSale}
            onRestock={state.onRestock}
            onUpdateStock={state.onUpdateStock}
          />
        )}

        {state.view === 'deliveries' && (
          <DeliveryView
            deliveries={state.deliveries}
            inventoryItems={state.inventoryItems}
            draft={state.deliveryDraft}
            onDraftChange={state.onDeliveryDraftChange}
            onReceive={state.onReceiveDelivery}
            onAdd={state.onAddDelivery}
          />
        )}

        {state.view === 'expenses' && (
          <ExpensesView
            expenses={state.expenses}
            draft={state.expenseDraft}
            onDraftChange={state.onExpenseDraftChange}
            onAdd={state.onAddExpense}
          />
        )}
      </main>
    </div>
  )
}

export default App
