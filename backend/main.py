import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import create_db_and_tables
from routes import jobs, notifications
from scheduler import start_scheduler
from utils.vapid_helper import get_or_create_vapid_keys

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("[Startup] Initializing database tables...")
    create_db_and_tables()
    try:
        from seed_sample_jobs import seed
        seed()
    except Exception as e:
        print(f"[Startup] Seeding note: {e}")
    print("[Startup] Initializing VAPID keys...")
    get_or_create_vapid_keys()
    print("[Startup] Starting reminder scheduler...")
    start_scheduler()
    yield
    # Shutdown (if any cleanup needed)
    print("[Shutdown] Shutting down application.")

app = FastAPI(
    title="Sarkari Job Notifier API",
    description="Backend API for Sarkari Job tracking, deadline reminders, and Web Push notifications.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
origins = [
    frontend_url,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]

# Allow any Vercel preview/production deployments
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jobs.router)
app.include_router(notifications.router)

@app.get("/")
def root():
    return {
        "app": "Sarkari Job Notifier API",
        "status": "running",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
