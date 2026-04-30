# System Management Stock

React and TypeScript frontend with a .NET API backend for a stock-management dashboard.

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

Backend:

```bash
cd backend
dotnet run
```

## Validation

```bash
npm run build
npm run lint
```

Backend:

```bash
cd backend
dotnet build
```

## Deployment

### Frontend on Vercel

- Framework preset: Vite
- Root directory: project root
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL=https://your-render-service.onrender.com/api`

### Backend on Render

- Service type: `Web Service`
- Environment: `Docker`
- Root directory: `backend`
- Build command: leave blank when using Docker
- Start command: leave blank when using Docker
- Environment variable: `ASPNETCORE_ENVIRONMENT=Production`
- Environment variable: `FrontendOrigin=https://your-vercel-project.vercel.app`
- Environment variable: `ConnectionStrings__Default=Data Source=/var/data/stock.db`

Render will build the API from `backend/Dockerfile`, which includes the .NET SDK and runtime needed for `net10.0`.

If you keep SQLite on Render, attach a persistent disk mounted at `/var/data` so data survives restarts and redeploys.

## Next backend step

Later, the local state in `src/data.ts` and `src/types.ts` can be replaced with a .NET API for:

- inventory items
- daily sales transactions
- delivery orders
- supplier management
- expense records
- user roles and audit history
