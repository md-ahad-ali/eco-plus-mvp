
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import analytics, auth, buildings, rooms, recommendations, upload, energy_logs

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://0.0.0.0:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analytics.router)
app.include_router(auth.router)
app.include_router(buildings.router)
app.include_router(rooms.router)
app.include_router(recommendations.router)
app.include_router(upload.router)
app.include_router(energy_logs.router)


@app.get("/")
def home():
    return {
        "message": f"Welcome to {settings.app_name}!",
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
