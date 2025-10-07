# 🧩 ClickBank Integration Handover

This document provides a full overview of the ClickBank tracking and dashboard module added to your SaaS.
Frontend: **Vercel (Next.js)**
Backend: **Railway (FastAPI + PostgreSQL + Celery)**

---

## ⚙️ 1. Database Schema (PostgreSQL)

All foreign keys use `UUID` for compatibility with your `users` table.

```sql
-- ClickBank Accounts
CREATE TABLE IF NOT EXISTS clickbank_accounts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  clerk_key TEXT NOT NULL,
  developer_key TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ClickBank Sales
CREATE TABLE IF NOT EXISTS clickbank_sales (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  transaction_id TEXT UNIQUE NOT NULL,
  product_title TEXT,
  amount NUMERIC,
  commission NUMERIC,
  transaction_date TIMESTAMP,
  type TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

✅ Both tables support multiple vendors/affiliates and automatically remove records if a user is deleted.

---

## 🧠 2. Celery Background Sync

Celery handles nightly ClickBank sync jobs.

### `worker.py`

```python
import os
from celery import Celery

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery = Celery("tasks", broker=REDIS_URL, backend=REDIS_URL)

celery.conf.beat_schedule = {
    "sync-clickbank-sales-nightly": {
        "task": "tasks.sync_clickbank_sales",
        "schedule": 60 * 60 * 24,  # every 24 hours
    },
}
```

### `src/platforms/clickbank/tasks.py`

```python
from worker import celery
from .services import clickbank_service
from app.db import database

@celery.task(name="tasks.sync_clickbank_sales")
def sync_clickbank_sales():
    rows = database.fetch_all("SELECT user_id FROM clickbank_accounts")
    for row in rows:
        user_id = row["user_id"]
        try:
            sales = clickbank_service.fetch_sales(user_id, days=1)
            for s in sales.get("transactions", []):
                database.execute(
                    """
                    INSERT INTO clickbank_sales
                        (user_id, transaction_id, product_title, amount, commission, transaction_date, type)
                    VALUES
                        (:user_id, :transaction_id, :product_title, :amount, :commission, :transaction_date, :type)
                    ON CONFLICT (transaction_id) DO NOTHING
                    """,
                    {
                        "user_id": user_id,
                        "transaction_id": s["transaction_id"],
                        "product_title": s["product_title"],
                        "amount": s["amount"],
                        "commission": s["commission"],
                        "transaction_date": s["transaction_date"],
                        "type": s["type"],
                    },
                )
        except Exception as e:
            print(f"Error syncing user {user_id}: {e}")
```

### Railway Procfile

```
web: uvicorn app.main:app --host 0.0.0.0 --port 8000
worker: celery -A worker.celery worker --loglevel=info
beat: celery -A worker.celery beat --loglevel=info
```

---

## 🛠️ 3. API Endpoints (FastAPI)

### `/clickbank/sales`

Fetches user-specific sales from PostgreSQL.

```python
from fastapi import APIRouter, Depends
from app.db import database
from app.auth import get_current_user

router = APIRouter(prefix="/clickbank", tags=["clickbank"])

@router.get("/sales")
async def get_sales(user: dict = Depends(get_current_user)):
    rows = await database.fetch_all(
        """
        SELECT id, product_title, amount, commission, transaction_date, type
        FROM clickbank_sales
        WHERE user_id = :user_id
        ORDER BY transaction_date DESC
        LIMIT 100
        """,
        {"user_id": user["id"]},
    )
    return {"sales": [dict(r) for r in rows]}
```

---

## 🎨 4. Dashboard (Next.js + Recharts)

### `components/clickbank/ClickBankDashboard.tsx`

* Displays sales table
* Shows line chart (Revenue vs Commission)
* Bar chart (Commission distribution)

```tsx
import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

export default function ClickBankDashboard() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clickbank/sales")
      .then((res) => res.json())
      .then((data) => setSales(data.sales || []))
      .finally(() => setLoading(false));
  }, []);

  const chartData = sales.map((s) => ({
    date: new Date(s.transaction_date).toLocaleDateString(),
    amount: s.amount,
    commission: s.commission,
  }));

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md space-y-8">
      <h2 className="text-xl font-bold">ClickBank Sales Dashboard</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line dataKey="amount" stroke="#3b82f6" name="Revenue" />
          <Line dataKey="commission" stroke="#10b981" name="Commission" />
        </LineChart>
      </ResponsiveContainer>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="commission" fill="#10b981" name="Commission" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

## 🚀 5. Flow Overview

1. User connects ClickBank credentials → stored in `clickbank_accounts`.
2. Nightly Celery job fetches sales via API → inserts into `clickbank_sales`.
3. Dashboard reads sales data from your DB (no live API call).
4. Charts + table visualize daily revenue and commissions.

---

## 🔒 6. Security Notes

* Each user record is isolated via `user_id` (UUID).
* Use a hidden **global developer key** on backend to reduce user friction.
* Never expose Clerk/Developer keys client-side.
* Add rate-limiting and validation for API endpoints.

---

## 📄 7. Next Steps

* [ ] Test manual Celery job run for data sync.
* [ ] Verify charts render correctly in staging.
* [ ] Deploy worker + beat on Railway.
* [ ] Add optional filters (date range, product, type).
* [ ] Add notifications for new sales (via WebSocket or email).

---

**Maintainer:**
*SaaS Dev Team — Vercel + Railway Stack*
*Integration completed: 2025-10-07*
