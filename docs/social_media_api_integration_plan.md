# 📘 Social Media API Integration - Handover Document

## 🚀 Overview
This document outlines the plan to integrate automated social media posting into your SaaS.  
Your stack: **Frontend (Next.js on Vercel)** + **Backend (Python on Railway)** + **PostgreSQL DB**.

---

## 1. Supported Platforms (Initial & Future)
- **Facebook + Instagram** → Meta Graph API
- **X (Twitter)** → Twitter API v2
- **LinkedIn** → LinkedIn Marketing API
- **YouTube** → YouTube Data API
- **TikTok** → TikTok Developer API (limited posting)

---

## 2. Authentication (OAuth 2.0)
1. Register app on each platform’s developer portal.
2. Get `client_id` and `client_secret`.
3. Implement OAuth flow:
   - Frontend → Redirect user to login.
   - Backend → Handle callback, exchange code for tokens.
   - Store tokens (access + refresh) in DB.
4. Refresh tokens automatically with cron/worker.

---

## 3. Backend (Railway, Python)
- Framework: **FastAPI** or **Flask**
- Routes:
  - `/auth/connect/{platform}`
  - `/auth/callback/{platform}`
  - `/post/schedule`
- Background jobs:
  - Use **Celery + Redis** or **APScheduler** for scheduling.
- Token refresh jobs.

---

## 4. Frontend (Vercel, Next.js)
- **Account Connection Dashboard**
  - Connect/Disconnect buttons for each platform.
- **Scheduler UI**
  - Text, media upload, select platforms, set time/date.
- **Logs UI**
  - Show post status & errors.

---

## 5. Database Schema (PostgreSQL)
```sql
-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  plan TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Social accounts
CREATE TABLE social_accounts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  platform TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Posts
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  content TEXT,
  media_url TEXT,
  scheduled_time TIMESTAMP,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Post logs
CREATE TABLE post_logs (
  id SERIAL PRIMARY KEY,
  post_id INT REFERENCES posts(id),
  platform TEXT NOT NULL,
  success BOOLEAN,
  response JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6. Posting Flow
1. User connects account → tokens stored.
2. User schedules a post → entry saved in `posts` table.
3. Worker checks jobs → sends via API.
4. Log success/failure in `post_logs`.
5. Refresh token & retry if expired.

---

## 7. Rate Limits & Scaling
- Use Redis + Celery to queue requests.
- Retry failed jobs.
- Handle platform rate limits gracefully.

---

## 8. Security
- Encrypt tokens in DB (AES or KMS).
- Store client secrets in Railway ENV vars.
- Enforce HTTPS.

---

## 9. Compliance
- **Meta** → Business verification required.
- **LinkedIn** → Need Marketing API approval.
- **TikTok** → Limited posting API.

---

## 10. Rollout Plan
1. Start with **Twitter + LinkedIn**.
2. Add **Facebook + Instagram**.
3. Expand to **YouTube + TikTok**.
4. Build analytics dashboard.

---

## ✅ API Route Structure (Example FastAPI)
```python
from fastapi import FastAPI, Depends
from routers import auth, posts

app = FastAPI()

# OAuth routes
app.include_router(auth.router, prefix="/auth")

# Post scheduling
app.include_router(posts.router, prefix="/post")
```

---

## ✅ Next Steps
- Implement database schema on Railway.
- Set up OAuth apps for each platform.
- Build backend routes in FastAPI.
- Build frontend connect + scheduler UI in Next.js.
- Add background workers for posting.
