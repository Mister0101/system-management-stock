# System Management Stock

React and TypeScript frontend for a stock-management dashboard using dummy data first, with the backend planned for a later .NET phase.

## Current MVP

- Daily dashboard with gross sales, costs, pending deliveries, and projected net.
- Inventory page where staff can record sales, restock items, and set exact stock counts.
- Deliveries page with incoming stock tracking and receive-delivery actions.
- Expenses page for daily operating costs that affect the dashboard totals.
- Browser-persisted demo state using local storage, plus a reset button for returning to seed data.

## Business model in this frontend

- Revenue is computed from inventory sales: `dailySold * sellPrice` for each item.
- Operating costs are tracked separately in the expenses register.
- Pending deliveries are counted as purchase commitments until marked as received.
- When a delivery is received, stock levels update immediately.

## Categories included

- Dishes
- Products
- Spirits

## Run locally

```bash
npm install
npm run dev
```

## Validation

```bash
npm run build
npm run lint
```

## Next backend step

Later, the local state in `src/data.ts` and `src/types.ts` can be replaced with a .NET API for:

- inventory items
- daily sales transactions
- delivery orders
- supplier management
- expense records
- user roles and audit history
