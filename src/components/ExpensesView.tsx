import type { FormEvent } from 'react'
import type { Expense, ExpenseCategory } from '../types'
import { expenseCategories } from '../data/data'
import { formatMoney } from '../utils/formatters'
import { PanelHeader } from './PanelHeader'

interface ExpenseDraft {
  name: string
  amount: string
  category: ExpenseCategory
  dueLabel: string
}

interface ExpensesViewProps {
  expenses: Expense[]
  draft: ExpenseDraft
  onDraftChange: (draft: ExpenseDraft) => void
  onAdd: (e: FormEvent<HTMLFormElement>) => void
}

export function ExpensesView({ expenses, draft, onDraftChange, onAdd }: ExpensesViewProps) {
  return (
    <div className="content-grid two-column-layout">
      <section className="panel">
        <PanelHeader
          title="Expense register"
          subtitle="Daily costs that reduce projected profit"
        />
        <div className="list-stack">
          {expenses.map((expense) => (
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
        <PanelHeader
          title="Add expense"
          subtitle="Model rent, utilities, delivery charges, or ad hoc spend"
        />
        <form className="editor-form" onSubmit={onAdd}>
          <label>
            Expense name
            <input
              value={draft.name}
              onChange={(e) => onDraftChange({ ...draft, name: e.target.value })}
              placeholder="Example: Emergency glassware restock"
            />
          </label>
          <div className="form-split">
            <label>
              Category
              <select
                value={draft.category}
                onChange={(e) =>
                  onDraftChange({ ...draft, category: e.target.value as ExpenseCategory })
                }
              >
                {expenseCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Amount
              <input
                inputMode="decimal"
                value={draft.amount}
                onChange={(e) => onDraftChange({ ...draft, amount: e.target.value })}
              />
            </label>
          </div>
          <label>
            Due label
            <input
              value={draft.dueLabel}
              onChange={(e) => onDraftChange({ ...draft, dueLabel: e.target.value })}
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
