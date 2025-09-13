# SaaS Email Integration Backend (FastAPI + Next.js)

This document provides a working starter for integrating multiple ESPs (Mailchimp, GetResponse, AWeber) plus a **SendGrid fallback** into your SaaS.

---

## 📂 Folder Structure

```
saas-app/
  frontend/    (Next.js on Vercel)
    pages/
      integrations.tsx
      api/
        auth/[provider].ts
  backend/     (FastAPI on Railway)
    app/
      main.py
      routes/
        auth.py
        integrations.py
        campaigns.py
        webhooks.py
      services/
        mailchimp.py
        getresponse.py
        aweber.py
        sendgrid_fallback.py
      utils/
        db.py
        crypto.py
    requirements.txt
```

---

## ⚡ Backend (FastAPI on Railway)

### `app/main.py`
```python
from fastapi import FastAPI
from app.routes import auth, integrations, campaigns, webhooks

app = FastAPI()

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(integrations.router, prefix="/integrations", tags=["integrations"])
app.include_router(campaigns.router, prefix="/campaigns", tags=["campaigns"])
app.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])

@app.get("/")
def root():
    return {"status": "Backend running"}
```
---

## 🔑 Auth Routes (Mailchimp, GetResponse, AWeber)

### `app/routes/auth.py`
```python
from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse, JSONResponse
import httpx
from app.utils.db import store_token, store_api_key

router = APIRouter()

# Mailchimp OAuth start
@router.get("/mailchimp/connect")
async def mailchimp_connect():
    redirect_uri = f"{'https://your-backend-url.onrailway.app'}/auth/mailchimp/callback"
    auth_url = (
        f"https://login.mailchimp.com/oauth2/authorize?"
        f"response_type=code&client_id=YOUR_MAILCHIMP_CLIENT_ID&redirect_uri={redirect_uri}"
    )
    return JSONResponse({"url": auth_url})

# Mailchimp OAuth callback
@router.get("/mailchimp/callback")
async def mailchimp_callback(code: str, request: Request):
    token_url = "https://login.mailchimp.com/oauth2/token"
    redirect_uri = f"{'https://your-backend-url.onrailway.app'}/auth/mailchimp/callback"

    async with httpx.AsyncClient() as client:
        res = await client.post(
            token_url,
            data={
                "grant_type": "authorization_code",
                "client_id": "YOUR_MAILCHIMP_CLIENT_ID",
                "client_secret": "YOUR_MAILCHIMP_CLIENT_SECRET",
                "redirect_uri": redirect_uri,
                "code": code,
            },
        )
        data = res.json()
        await store_token("user123", "mailchimp", data["access_token"])

    return RedirectResponse("https://your-frontend-url.vercel.app/integrations?success=1")

# GetResponse API Key connect
@router.post("/getresponse/connect")
async def getresponse_connect(body: dict):
    api_key = body.get("apiKey")
    await store_api_key("user123", "getresponse", api_key)
    return {"success": True}

# AWeber OAuth start
@router.get("/aweber/connect")
async def aweber_connect():
    redirect_uri = f"{'https://your-backend-url.onrailway.app'}/auth/aweber/callback"
    auth_url = (
        f"https://auth.aweber.com/oauth2/authorize?"
        f"client_id={'YOUR_AWEBER_CLIENT_ID'}"
        f"&response_type=code"
        f"&redirect_uri={redirect_uri}"
    )
    return JSONResponse({"url": auth_url})

# AWeber OAuth callback
@router.get("/aweber/callback")
async def aweber_callback(code: str, request: Request):
    token_url = "https://auth.aweber.com/oauth2/token"
    redirect_uri = f"{'https://your-backend-url.onrailway.app'}/auth/aweber/callback"

    async with httpx.AsyncClient() as client:
        res = await client.post(
            token_url,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": redirect_uri,
                "client_id": "YOUR_AWEBER_CLIENT_ID",
                "client_secret": "YOUR_AWEBER_CLIENT_SECRET",
            },
        )
        data = res.json()
        await store_token("user123", "aweber", data["access_token"])

    return RedirectResponse("https://your-frontend-url.vercel.app/integrations?success=1")
```
---

## 📧 SendGrid Fallback

### `app/services/sendgrid_fallback.py`
```python
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")

def send_fallback_email(to_email: str, subject: str, html_content: str, from_email="noreply@yourapp.com"):
    message = Mail(
        from_email=from_email,
        to_emails=to_email,
        subject=subject,
        html_content=html_content,
    )
    sg = SendGridAPIClient(SENDGRID_API_KEY)
    response = sg.send(message)
    return {"status": response.status_code}
```
---

## 🚀 Campaign Sending Route

### `app/routes/campaigns.py`
```python
from fastapi import APIRouter
from app.utils.db import get_credentials
from app.services import mailchimp, getresponse, aweber, sendgrid_fallback

router = APIRouter()

@router.post("/send-campaign")
async def send_campaign(user_id: str, provider: str, subject: str, html: str, to_email: str):
    creds = await get_credentials(user_id, provider)

    if provider == "mailchimp" and creds:
        return await mailchimp.send_email(creds["token"], subject, html, to_email)

    elif provider == "getresponse" and creds:
        return await getresponse.send_email(creds["api_key"], subject, html, to_email)

    elif provider == "aweber" and creds:
        return await aweber.send_email(creds["token"], subject, html, to_email)

    elif provider == "sendgrid-fallback":
        return sendgrid_fallback.send_fallback_email(to_email, subject, html)

    return {"error": "No valid credentials for provider"}
```
---

## 📦 requirements.txt

```
fastapi
uvicorn
httpx
sendgrid
```
---

## 🔑 Secrets Needed

- Railway:  
  - `MAILCHIMP_CLIENT_ID` / `MAILCHIMP_CLIENT_SECRET`  
  - `AWEBER_CLIENT_ID` / `AWEBER_CLIENT_SECRET`  
  - `SENDGRID_API_KEY`  
  - `BACKEND_URL`  
  - `FRONTEND_URL`  

- Vercel:  
  - `NEXT_PUBLIC_BACKEND_URL`  

---

## ✅ Summary

Your SaaS backend now supports:

- Mailchimp (OAuth)  
- GetResponse (API key)  
- AWeber (OAuth)  
- SendGrid fallback (SMTP, for instant sending)  
