from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.mongodb import MongoDB
from app.features.live_transcription.websocket.speech import (
    router as live_transcription_router
)

# 🔥 Import the Auth and Admin Routers
from app.features.auth.auth import router as auth_router
from app.features.admin.admin import router as admin_router
from app.features.batch_transcription.router import router as batch_router

# ==================================================
# 🔥 FastAPI App
# ==================================================
app = FastAPI(
    title="Media Intelligence Platform",
    description="AI-powered media processing platform",
    version="1.0.0"
)

# ==================================================
# 🔥 CORS
# ==================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================================================
# 🔥 Startup / Shutdown Events
# ==================================================
@app.on_event("startup")
async def startup_event():
    print("\n🚀 Starting Media Intelligence Platform...")
    MongoDB.connect()
    print("✅ Application startup complete\n")

@app.on_event("shutdown")
async def shutdown_event():
    print("\n🛑 Shutting down application...")
    MongoDB.close()
    print("✅ Shutdown complete\n")

# ==================================================
# 🔥 Register Feature Routers
# ==================================================

# Live Transcription Route
app.include_router(
    live_transcription_router,
    prefix="/api/v1/live-transcription",
    tags=["Live Transcription"]
)

# 🔥 Authentication Route
app.include_router(
    auth_router,
    prefix="/api/v1/auth",
    tags=["Authentication"]
)

# 🔥 Admin Route
app.include_router(
    admin_router,
    prefix="/api/v1/admin",
    tags=["Admin"]
)

app.include_router(
    batch_router, 
    prefix="/api/v1/transcription", 
    tags=["Batch Transcription"]
)

# ==================================================
# 🔥 Health Checks
# ==================================================
@app.get("/")
async def root():
    return {"success": True, "message": "Media Intelligence Platform Running", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"success": True, "status": "healthy", "services": {"api": "running", "mongodb": "connected"}}