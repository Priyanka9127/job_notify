# 📢 Job Notifier — FastAPI + React PWA

An automated Sarkari Job tracking, deadline countdown, and instant Web Push notification application.

- **Backend**: FastAPI (Python), SQLModel, APScheduler, pywebpush (VAPID)
- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Vite PWA
- **Database**: Local SQLite (zero-config out-of-the-box) or PostgreSQL (Supabase / Neon on cloud)
- **Notifications**: Standard W3C Web Push API (works across mobile Chrome, Edge, Safari on iOS 16.4+, and desktops without third-party subscriptions)

---

## ⚡ Quick Start (Run Locally)

### 1. Start Backend
Double-click `run_backend.bat` or run:
```bash
cd backend
# Activate virtualenv:
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate
python main.py
```
- API will start at: `http://localhost:8000`
- Interactive Swagger API docs: `http://localhost:8000/docs`

### 2. Start Frontend
Double-click `run_frontend.bat` or run:
```bash
cd frontend
npm run dev
```
- Open browser at: `http://localhost:5173`

---

## 🔔 How Push Notifications Work

1. On the web app, click **"Enable Notifications"**.
2. The browser registers `/sw.js` and requests permission.
3. The app subscribes using the server's VAPID public key and stores the subscription in the database.
4. When a new job is posted or when deadlines approach (**7 days**, **3 days**, **1 day**, and **last date**), the APScheduler sends an automatic notification.
5. Clicking the notification opens the official application link directly.
6. Marking a job as **"Applied"** or letting it expire automatically stops further alerts for that job.

---

## 🚀 Easy Deployment (Access Anywhere)

### Step 1: Database (Free PostgreSQL on Neon or Supabase)
1. Go to [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com) and create a free project.
2. Copy your PostgreSQL connection string (e.g. `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require`).

### Step 2: Backend (Render.com)
1. Push this repository to GitHub.
2. Log in to [Render.com](https://render.com) -> **New Web Service** -> Select your repository.
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables on Render:
   - `DATABASE_URL`: Your Supabase/Neon PostgreSQL URL
   - `VAPID_PUBLIC_KEY`: (Copy from `backend/.env` generated locally)
   - `VAPID_PRIVATE_KEY`: (Copy from `backend/.env` generated locally)
   - `VAPID_CLAIM_EMAIL`: `mailto:your-email@example.com`
   - `FRONTEND_URL`: `https://your-frontend-subdomain.vercel.app`
5. Click **Deploy**. You will get a URL like `https://sarkari-notifier-api.onrender.com`.

### Step 3: Frontend (Vercel)
1. Log in to [Vercel.com](https://vercel.com) -> **Add New Project** -> Import your GitHub repository.
2. Settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://sarkari-notifier-api.onrender.com` (your Render URL from Step 2)
4. Click **Deploy**. You get a live link like `https://sarkari-notifier.vercel.app`.

### Step 4: Install on Mobile (PWA)
1. Open your Vercel URL on your phone's browser (Chrome on Android or Safari on iOS).
2. Tap the browser menu (**⋮** or **Share button**) -> **"Add to Home Screen"**.
3. It installs like a native mobile app with instant push alerts!
